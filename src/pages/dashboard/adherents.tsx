/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "@ui/dashboardLayout";
import { api } from "@utils/api";
import type { Adherent, Service, User } from "@prisma/client";
import { type ColumnsType } from "antd/lib/table";
import MyTable, { ActionTable } from "@ui/components/table";
import moment from "moment";
import html2canvas from 'html2canvas';
import idCard from "../../ui/idCard";
import * as XLSX from "xlsx";
import { fill, scale, thumbnail } from "@cloudinary/url-gen/actions/resize";
import {
  Button,
  ConfigProvider,
  DatePicker,
  Divider,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Slider,
  Tag,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  DownloadOutlined,
} from "@ant-design/icons";
import type { GetServerSideProps } from "next";
import { AdvancedImage } from "@cloudinary/react";
import { getServerAuthSession } from "@server/auth";
import Search from "antd/lib/input/Search";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import {
  BsGenderMale as IoMaleSharp,
  BsGenderFemale as IoFemale,
} from "react-icons/bs";
import toast from "react-hot-toast";
import ExportButton from "@ui/exportButton";
import MyUpload from "@ui/myUpload";
import cloudy from "@utils/cloudinary";
import {
  lazyload,
  responsive,
  accessibility,
  placeholder,
} from "@cloudinary/react";
import { DATE_FORMAT } from "@config/index";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: true,
      },
    };
  }

  return {
    props: {},
  };
};
const Services = () => {
  const [updateMembre, setupdateMembre] = useState<Adherent | undefined>(
    undefined
  );
  const [card, setcard] = useState<Adherent | undefined>(undefined);
  const [dataFilter, setDataFilter] = useState<Adherent[]>([]);
  const { data, isLoading, refetch } = api.adherent.getAll.useQuery(undefined, {
    onSuccess(data) {
      setDataFilter(data);
    },
  });
  const { mutate: deleteMember } = api.adherent.delete.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("???? ?????? ?????????? ??????????");
      void refetch();
    },
    onError: () => {
      toast.dismiss();
      toast.error("?????? ?????? ????");
    },
    onMutate: () => {
      toast.loading("???????? ?????? ??????????");
    },
  });

  const columns: ColumnsType<Adherent> = [
    {
      title: "?????????? ????????????",
   
      dataIndex: "photoId",
      key: "photoId",
      render: (v, a) => (
        <AdvancedImage
          cldImg={cloudy
            .image(
              v ? v : a.sexe == "F" ? "placeholder_female" : "placeholder_male"
            )
            .resize(thumbnail().width(50))}
          plugins={[lazyload(), responsive(), accessibility(), placeholder()]}
        />
      ),
    },
    {
      title: "?????????? ????????????",
      dataIndex: "name",
      key: "name",
      render: (v) => <span className={"text-md font-bold"}>{v}</span>,
    },
    {
      title: "??????????",
      width: 50,
      align: "center",
      dataIndex: "sexe",
      key: "sexe",
      render: (v) =>
        v === "M" ? (
          <span className={"text-md font-bold"}>
            <IoMaleSharp />
          </span>
        ) : (
          <span className={"text-md font-bold"}>
            <IoFemale />
          </span>
        ),
    },
    {
      title: "????????????",
      dataIndex: "profession",
      key: "profession",
    },
    {
      title: "?????? ?????????? ??????????????",
      align: "center",
      dataIndex: "identifiant",
      key: "identifiant",
    },
    {
      title: "??????????",
      align: "center",
      width: 70,
      dataIndex: "isPaid",
      key: "isPaid",
      render: (v) => (v ? <CheckCircleTwoTone /> : <CloseCircleTwoTone />),
    },
    {
      title: "???????????? ????????????????????",

      dataIndex: "email",
      key: "email",
      render: (v) => <span className={"font-ligh text-sm italic"}>{v}</span>,
    },
    {
      title: "?????????? ????????????????",
      dataIndex: "dateDebutAbonnement",
      key: "dateDebutAbonnement",
      render: (v) => <span className={"text-[12px] opacity-60"}>{v}</span>,
    },
    {
      title: "?????????? ?????????? ????????????????",
      dataIndex: "dateNouvelAbonnement",
      key: "dateNouvelAbonnement",
      render: (v) => <span className={"text-[12px] opacity-60"}>{v}</span>,
    },
    {
      title: "",
      dataIndex: "action",
      key: "action",
      render: (_, d) => (
        <ActionTable
          onEdit={() => {
            setupdateMembre(d);
          }}
          onCard={() => {
            // setupdateMembre(d);
            setcard(d);
          }}
          onDelete={() => {
            deleteMember({ id: d.id });
          }}
          onView={()=>{
            setShowDialog(d)
          }}
        />
      ),
    },
  ];

  const filter = (v: string) => {
    if (data) {
      if (!v) {
        setDataFilter(data || []);
        return;
      }
      const newData = (data || []).filter((d) => {
        return d.name.includes(v) || (d.email || "").includes(v);
      });
      setDataFilter(newData || []);
    }
  };

  const fileRef = useRef<HTMLInputElement>(null);
  const onPickfile = () => fileRef.current?.click();
  const { mutate: importAdherent, isLoading: uploadingAdherent } =
    api.adherent.import.useMutation({
      onSuccess: () => {
        toast.dismiss();
        toast.success("???? ?????????? ?????????? ??????????");
        void refetch();
      },
      onError: () => {
        toast.dismiss();
        toast.error("?????? ?????? ????");
      },
      onMutate: () => {
        toast.loading("???????? ?????????? ??????????");
      },
    });

  const onImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        // evt = on_file_select event
        /* Parse data */
        const bstr = e.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        /* Get first worksheet */
        const wsname = wb.SheetNames[0];
        if (wsname) {
          const ws = wb.Sheets[wsname];
          /* Convert array of arrays */
          const data: any = XLSX.utils.sheet_to_json(ws!, {
            raw: false,
          });
          /* Update state */
          toast.dismiss();
          const lines = data;
          function familyStatus(
            v: string | undefined
          ): "C" | "M" | "D" | undefined {
            if (v === undefined) return undefined;
            if (v.includes("????????")) return "C";
            if (v.includes("??????????")) return "M";
            if (v.includes("????????")) return "D";

            return undefined;
          }

          function sifa(v: string | undefined): "A" | "P" | undefined {
            if (v === undefined) return undefined;
            if (v.includes("????????")) return "P";
            else return "A";
          }

          function stringToInt(
            v: string | undefined | number
          ): number | undefined {
            if (v === undefined) return undefined;
            if (typeof v === "number") return v;
            return parseInt(v);
          }
          importAdherent(
            lines.map((l: any, i: number) => {
              const obj = {
                name: l["??????????\n"] + " " + l["??????????\n"],
                sexe: l["??????????"] && l["??????????"] === "????????" ? "F" : "M",
                familyStatus: familyStatus(l["?????????????? ????????????????????"]),
                email: l["???????? ????????????????????"],
                childrenNumber: stringToInt(l["?????? ??????????????"]),
                identifiant: l["?????? ?????????? ??????????????"],
                anneeTravail: l["?????? ?????????? ??????????"],
                sifa: sifa(l["??????"]),
                lieuTravail: l["??????????????"],
                createdAt:
                  l["?????????? ??????????????"] &&
                  moment(l["?????????? ??????????????"]).toDate().toISOString(),
                dateNouvelAbonnement: l["?????????? ???????????? ????????????????"],
                dateDebutAbonnement: l["?????????? ?????????? ??????????????"],
                isPaid: l["??????????"] && l["??????????"] === "??????" ? true : false,
                tel: l["????????"],
                address: l["??????????"],
                num: stringToInt(l["?????? ??????????????"]),
                //???????? ????????????????
                //?????????? ????????????????
                //?????? ?????????? ??????????????
              };
              if (i == 0) {
                console.log(Object.keys(data[0]));
              }
              return obj;
            })
          );
          console.log("data", data);

          //
        }
      };
      reader.readAsBinaryString(file);
    }
  };
  const [showDialog, setShowDialog] = useState<Adherent|undefined>(undefined);
  return (
    <>
    
    <ShowDialog membre={showDialog} open={showDialog!=undefined} onClose={()=>setShowDialog(undefined)}/>
      {card && <CardAdherent item={card} onClose={() => setcard(undefined)} />}
      {card && <CardAdherentPrint item={card} onClose={() => setcard(undefined)} />}
      <DashboardLayout>
        <div className="flex w-full flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-gray-700">??????????????????</h1>
          <div className={""}>
            <div className={"flex flex-row-reverse items-center gap-6 py-6 "}>
              <Button
                className={"flex flex-row items-center gap-2"}
                onClick={onPickfile}
                loading={uploadingAdherent}
                size={"large"}
              >
                <UploadOutlined />

                <input
                  onChange={onImport}
                  hidden
                  ref={fileRef}
                  type="file"
                  accept=".xlsx, .xls"
                />
              </Button>
              <AddMemberDialog
                onAdd={() => refetch()}
                membre={updateMembre}
                onClose={() => setupdateMembre(undefined)}
              />
              <Search
                placeholder="???????? ????????"
                allowClear
                enterButton="??????????"
                size="large"
                className={"w-[300px]"}
                onSearch={filter}
              />
              <div className={"flex-grow"}></div>

              <ExportButton
                tableName={"??????????????????"}
                data={dataFilter.map((d) => {
                  return {
                    ??????????: d.name,
                    ??????????: d.sexe == "M" ? "??????" : "????????",
                    "?????????????? ????????????????????":
                      d.familyStatus == "C"
                        ? "????????"
                        : d.familyStatus == "M"
                        ? "??????????"
                        : "????????",
                    "???????????? ????????????????????": d.email,
                    "?????? ??????????????": d.childrenNumber,
                    "?????? ?????????? ??????????????": d.identifiant,
                    "?????? ?????????? ??????????": d.anneeTravail,
                    ??????: d.sifa == "A" ? "??????" : "????????",
                    ??????????????: d.lieuTravail,
                    "?????????? ??????????????": d.createdAt,
                    "?????????? ???????????? ????????????????": d.dateNouvelAbonnement,
                    "?????????? ?????????? ??????????????": d.dateDebutAbonnement,
                    ??????????: d.isPaid ? "??????" : "????",
                    ????????: d.tel,
                    ??????????: d.address,
                    "?????? ??????????????": d.num,
                  };
                })}
              />
            </div>

            <MyTable
            
           //   rowClassName="cursor-pointer"
              loading={isLoading}
              data={dataFilter || []}
              // xScroll={1000}

              columns={columns as any}
              // columns={columns.filter((c)=>options.includes(c.key))}
            />
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Services;

const cardWidth = 324;
const cardHeight = 204;
const cardRadius = 10;
const CardAdherent = ({
  item,
  onClose,
}: {
  item: Adherent;
  onClose: () => void;
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
 
  return (
    <>
      <div
        onClick={onClose}
        ref={componentRef}
        className="fixed top-0 left-0 z-[10001] flex h-screen w-screen flex-col items-center justify-center gap-6 bg-black/70"
      >
        <div className="flex flex-row gap-10">
          <CardShape>
            <div className="flex flex-row items-center justify-center">
              <img
                src="/logo_2.png"
                style={{ height: cardHeight }}
                className="object-contain"
                alt="logo_2"
              />
            </div>
          </CardShape>
          <CardShape>
            <div className="flex h-full w-full flex-col items-stretch gap-1">
              <div className="flex flex-grow flex-row items-stretch gap-3">
                <div className="flex flex-grow flex-col">
                  <img
                    src="/logo_large.png"
                    style={{}}
                    className="w-[220px] object-contain"
                    alt="logo_2"
                  />
                  <div className="flex flex-grow flex-col items-start justify-center gap-1 text-sm">
                    <span>{`?????? ?????????????? : ${item.identifiant || ""}`}</span>
                    <span>{`?????????? ???????????? : ${item.name || ""}`}</span>{" "}
                    <span>{`??????????????: ${item.lieuTravail || ""}`}</span>{" "}
                    <span>
                      {`?????????? ?????? ???????? : ${item.dateNouvelAbonnement || ""}`}
                    </span>
                  </div>
                </div>

                <div className="flex w-[100px] flex-col">
                  <AdvancedImage
                    cldImg={cloudy
                      .image(
                        item.photoId
                          ? item.photoId
                          : item.sexe == "F"
                          ? "placeholder_female"
                          : "placeholder_male"
                      )
                      .resize(thumbnail().width(90))}
                    plugins={[
                      lazyload(),
                      responsive(),
                      accessibility(),
                      placeholder(),
                    ]}
                  />
                  <span className="text-center text-blue-400">
                    {item.sifa === "A" ? "??????????" : "????????"}
                  </span>
                  <span className="leading-1 text-center text-[10px] tracking-tighter">
                    ?????????? ?????????? ??????????????
                    <br />
                    ???????? ????????
                  </span>
                  <img
                    src="/signature.png"
                    style={{}}
                    className="h-[30px] object-contain"
                    alt="logo_2"
                  />
                </div>
              </div>
              <div className="h-[1px] bg-blue-700"></div>
              <div className="text-center text-[11px]">
                ?????????????? ?????????????? ?????????????? ???????????????? 25 ???????? ?????????? ?????? ???????? ????????????
                ???????? : 0537709331
              </div>
            </div>
          </CardShape>
        </div>
      </div>
    </>
  );
};


const CardAdherentPrint = ({
  item,
  onClose,
}: {
  item: Adherent;
  onClose: () => void;
}) => {
  const componentRef = useRef<HTMLElement>(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const onPrint = () => {
    console.log("print");
  };

  const handleDownloadImage = async () => {
    const element = componentRef.current;
    const canvas = await html2canvas(element||document.createElement('div'));

    const data = canvas.toDataURL('image/jpg');
    const link = document.createElement('a');

    if (typeof link.download === 'string') {
      link.href = data;
      link.download = 'image.jpg';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(data);
    }
  };
 
  


const toPDFi=()=>{
  let elems = document.querySelectorAll('.elemClass');
  console.log(elems)
let pdf = new jsPDF("portrait", "mm", "a4") as any;
pdf.scaleFactor = 2;

// Fix Graphics Output by scaling PDF and html2canvas output to 2

  const addPages = new Promise((resolve,reject)=>{
    elems.forEach((elem, idx) => {
      // Scaling fix set scale to 2
      html2canvas(elem as any, {scale: 2})
        .then(canvas =>{
          if(idx < elems.length - 1){
            pdf.addImage(canvas.toDataURL("image/png"), 0, 0, 210, 297);
            pdf.addPage();
          } else {
            pdf.addImage(canvas.toDataURL("image/png"), 0, 0, 210, 297);
            console.log("Reached last page, completing");
          }
    })
    
    setTimeout(resolve, 100, "Timeout adding page #" + idx);
  })
})
  addPages.finally(()=>{
     console.log("Saving PDF");
     pdf.save();
  });

}
  return (
    <>
   
      <div
        onClick={onClose}
        className="fixed bottom-[100px] left-0 z-[12000] flex h-screen w-screen flex-col items-center justify-end gap-6"
      >
        <Button
          type="primary"
          onClick={(e) => {
            e.stopPropagation();
           // await handleDownloadImage()
          // toPDFi()
        handlePrint();
          }}
          icon={<DownloadOutlined />}
          size={"large"}
        >
          ??????
        </Button>
      </div>

      <div
        onClick={onClose}
  
        className="fixed top-0 left-0 z-[-10000] flex h-screen w-screen flex-col items-center justify-center gap-6 bg-black/30"
      >
        
        <div       ref={componentRef as any} className="flex flex-col gap-10">
          <div className="elemClass h-[93vh] p-5">
         
          <CardShape>
            <div className="flex h-full w-full flex-col items-stretch gap-1">
              <div className="flex flex-grow flex-row items-stretch gap-3">
              <div className="flex w-[100px] flex-col">
                  <AdvancedImage
                    cldImg={cloudy
                      .image(
                        item.photoId
                          ? item.photoId
                          : item.sexe == "F"
                          ? "placeholder_female"
                          : "placeholder_male"
                      )
                      .resize(thumbnail().width(90))}
                    plugins={[
                      lazyload(),
                      responsive(),
                      accessibility(),
                      placeholder(),
                    ]}
                  />
                  <span className="text-center text-blue-400">
                    {item.sifa === "A" ? "??????????" : "????????"}
                  </span>
                  <span className="leading-1 text-center text-[10px] tracking-tighter">
                    ?????????? ?????????? ??????????????
                    <br />
                    ???????? ????????
                  </span>
                  <img
                    src="/signature.png"
                    style={{}}
                    className="h-[30px] object-contain"
                    alt="logo_2"
                  />
                </div>
                <div className="flex flex-grow flex-col">
                  <img
                    src="/logo_large.png"
                    style={{}}
                    className="w-[220px] object-contain"
                    alt="logo_2"
                  />
                  <div className="flex flex-grow flex-col items-end justify-center gap-1 text-sm ">
                    <span>{ `${item.identifiant || ""} : ?????? ??????????????`}</span>
                    <span>{ `${item.name || ""} : ?????????? ????????????`}</span>{" "}
                    <span>{`${item.lieuTravail || ""} : ??????????????`}</span>{" "}
                    <span>
                      {`${item.dateNouvelAbonnement || ""} : ?????????? ?????? ????????`}
                    </span>
                  </div>
                </div>

               
              </div>
              <div className="h-[1px] bg-blue-700"></div>
              <div className="text-center text-[11px]">
                ?????????????? ?????????????? ?????????????? ???????????????? 25 ???????? ?????????? ?????? ???????? ????????????
                ???????? : 0537709331
              </div>
            </div>
          </CardShape>
          </div>
          <div className="elemClass h-[96vh] p-5">
          <CardShape>
            <div className="flex flex-row items-center justify-center">
              <img
                src="/logo_2.png"
                style={{ height: cardHeight }}
                className="object-contain"
                alt="logo_2"
              />
            </div>
          </CardShape>
          </div>
        </div>
      </div>
    </>
  );
};
const CardShape = ({ children }: { children: any }) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ width: cardWidth, height: cardHeight, borderRadius: cardRadius }}
      className="bg-white  p-6"
    >
      {children}
    </div>
  );
};

type TMember = {
  name: string;
  email?: string;
  sexe: "M" | "F";
  dateNaissance?: string;
  lieuNaissance?: string;
  familyStatus: "C" | "M" | "D" |"V";
  sifa: "A" | "P";
  childrenNumber?: number;
  tel?: string;
  profession?: string;
  lieuTravail?: string;
  cin?: string;
  identifiant?: string;
  ville?: string;
  identifiant2?: string;
  anneeTravail?: string;
  isPaid: boolean;
  dateDebutAbonnement: string;
  photoId?: string;
};
const AddMemberDialog = ({
  onAdd,
  membre,
  onClose,
}: {
  onAdd: () => void;
  onClose: () => void;
  membre: Adherent | undefined;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<TMember>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (membre) {
      setIsModalOpen(true);
      setValue("name", membre.name);
      setValue("email", membre.email || "");
      setValue("tel", membre.tel || undefined);
      setValue("sexe", membre.sexe || "M");
      setValue("dateNaissance", membre.dateNaissance || undefined);
      setValue("lieuNaissance", membre.lieuNaissance || undefined);
      setValue("familyStatus", membre.familyStatus || "C");
      setValue("childrenNumber", membre.childrenNumber || undefined);
      setValue("profession", membre.profession || undefined);
      setValue("lieuTravail", membre.lieuTravail || undefined);
      setValue("cin", membre.cin || "");
      setValue("ville", membre.ville || undefined);
      setValue("identifiant", membre.identifiant || undefined);
      setValue("identifiant2", membre.identifiant2 || undefined);
      setValue("anneeTravail", membre.anneeTravail || undefined);
      setValue("isPaid", membre.isPaid);
      setValue("photoId", membre.photoId || undefined);
      //FixMe: fix date
      setValue("dateDebutAbonnement", membre.dateDebutAbonnement || "");
      setValue("sifa", membre.sifa || "P");

    }
  }, [membre, setValue]);

  const showModal = () => {
    setIsModalOpen(true);
    reset();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    onClose();
  };

  const handleOk = () => handleSubmit(onSubmit)();
  const { mutate: add, isLoading } = api.adherent.add.useMutation({
    onSuccess: () => {
      toast.success("?????? ?????????????? ??????????");
      setIsModalOpen(false);
      onAdd();
    },
    onError: (e) => {
      console.log(e);
      toast.error("?????? ??????");
    },
  });

  const { mutate: update, isLoading: updateLoading } =
    api.adherent.update.useMutation({
      onSuccess: () => {
        toast.success("???? ?????????????? ??????????");
        setIsModalOpen(false);
        onAdd();
      },
      onError: (e) => {
        console.log(e);
        toast.error("?????? ??????");
      },
    });

  const onSubmit: SubmitHandler<TMember> = (data: TMember) => {
    if (uploading) {
      toast.error("?????? ???????????? ???????????? ?????? ????????????");
      return;
    }
    if (!data.name || !data.sexe) {
      toast.error("?????? ?????? ???????? ????????????");
      return;
    }
    if (!data.photoId) {
      toast.error("?????? ?????????? ????????");
      return;
    }
    if (membre)
      update({
        id: membre.id,
        name: data.name,
        email: data.email || "",
        sexe: data.sexe,
        dateNaissance: data.dateNaissance,
        lieuNaissance: data.lieuNaissance,
        familyStatus: data.familyStatus,
        childrenNumber: data.childrenNumber,
        tel: data.tel,
        profession: data.profession,
        lieuTravail: data.lieuTravail,
        cin: data.cin || "",
        identifiant: data.identifiant,
        identifiant2: data.identifiant2,
        ville: data.ville,
        anneeTravail: data.anneeTravail,
        isPaid: data.isPaid,
        sifa: data.sifa,
        photoId: data.photoId,
        dateDebutAbonnement: data.dateDebutAbonnement,
      });
    else
      add({
        name: data.name,
        email: data.email || "",
        sexe: data.sexe,
        dateNaissance: data.dateNaissance,
        lieuNaissance: data.lieuNaissance,
        familyStatus: data.familyStatus,
        childrenNumber: data.childrenNumber,
        tel: data.tel,
        ville: data.ville,
        profession: data.profession,
        lieuTravail: data.lieuTravail,
        cin: data.cin || "",
        identifiant: data.identifiant,
        identifiant2: data.identifiant2,
        anneeTravail: data.anneeTravail,
        isPaid: data.isPaid,
        dateDebutAbonnement: data.dateDebutAbonnement,
        sifa: data.sifa,
        photoId: data.photoId,
      });
  };

  const { data: services, isLoading: gettingService } =
    api.service.getAll.useQuery();
  return (
    <>
      <Button
        onClick={showModal}
        icon={<PlusOutlined />}
        type={"primary"}
        size={"large"}
      >
        ????????
      </Button>
      <Modal
        title={membre ? "?????????? ????????????" : "?????? ????????????"}
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={isLoading || updateLoading}
        destroyOnClose={true}
        width={900}
        className="h-screen w-screen"
        onCancel={handleCancel}
      >
        <div className="flex flex-row gap-6">
          <div className="w-1/2 space-y-3 py-6">
            <Form.Item label="????????" required labelCol={{ span: 7 }}>
              <MyUpload
                onSuccess={(key: string) => setValue("photoId", key)}
                isUploading={uploading}
                setUploading={(b: boolean) => setUploading(b)}
              />
            </Form.Item>
            <Form.Item label="?????????? ???????????? " required labelCol={{ span: 7 }}>
              <Controller
                name="name"
                defaultValue=""
                control={control}
                render={({ field }) => (
                  <Input status={errors.name && "error"} {...field} />
                )}
              />
            </Form.Item>
            <Form.Item label="??????????" labelCol={{ span: 7 }}>
              <Controller
                name="sexe"
                control={control}
                defaultValue={"M"}
                render={({ field }) => (
                  <Radio.Group {...field}>
                    <Radio value={"M"}>??????</Radio>
                    <Radio value={"F"}>????????</Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>
            <Form.Item
              label="???????????? ????????????????????"
              required
              labelCol={{ span: 7 }}
            >
              <Controller
                name="email"
                defaultValue=""
                control={control}
                render={({ field }) => <Input type="email" {...field} />}
              />
            </Form.Item>

            <Form.Item label="????????????" labelCol={{ span: 7 }}>
              <Controller
                name="tel"
                defaultValue=""
                control={control}
                render={({ field }) => <Input type="number" {...field} />}
              />
            </Form.Item>
            <Form.Item label="?????????????? ????????????????????" labelCol={{ span: 7 }}>
              <Controller
                name="familyStatus"
                control={control}
                defaultValue="C"
                render={({ field }) => (
                  <Radio.Group {...field}>
                    <Radio value={"C"}>????????</Radio>
                    <Radio value={"M"}>??????????</Radio>
                    <Radio value={"D"}>????????</Radio>

                    <Radio value={"V"}>????????</Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>

            <Form.Item
              required={watch("familyStatus") != "C"}
              label="?????? ??????????????"
              labelCol={{ span: 7 }}
            >
              <Controller
                name="childrenNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    disabled={watch("familyStatus") == "C"}
                    type="number"
                    {...field}
                    onChange={(e) =>
                      setValue("childrenNumber", parseInt(e.target.value))
                    }
                  />
                )}
              />
            </Form.Item>
            <Form.Item label="?????????? ??????????????" labelCol={{ span: 7 }}>
              <DatePicker
                className="w-full"
                // value={dayjs}// Dayjswatch("dateNaissance")}
               // value={watch("dateNaissance")}
                onChange={(e) =>
                  setValue("dateNaissance", e?.format(DATE_FORMAT))
                }
              />
            </Form.Item>
            <Form.Item label="???????? ????????????????" labelCol={{ span: 7 }}>
              <Controller
                name="lieuNaissance"
                defaultValue=""
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </div>

          <Divider type="vertical" className="h-auto" />

          <div className="w-1/2 py-6">
            <Form.Item label="?????? ?????????????? ??????????????" required>
              <Controller
                name="cin"
                defaultValue=""
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
            <Form.Item label="??????????" labelCol={{ span: 0 }}>
                <Controller
                  name="sifa"
                  control={control}
                  defaultValue="P"
                  render={({ field }) => (
                    <Radio.Group {...field}>
                      <Radio value={"A"}>??????????</Radio>
                      <Radio value={"P"}>????????</Radio>
                    </Radio.Group>
                  )}
                />
              </Form.Item>
            <div className="flex flex-row gap-2">
            <Form.Item label="?????? ?????????? ??????????????">
                <Controller
                  name="identifiant2"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>
              <Form.Item label="?????? ?????????? ??????????????">
                <Controller
                  name="identifiant"
                  defaultValue=""
                  
                 
                  control={control}
                  render={({ field }) => <Input  {...field} />}
                />
              </Form.Item>
            </div>

            <div className="flex flex-row gap-2">
              <Form.Item label="????????????" className="w-1/2">
                <Controller
                  name="profession"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>
              <Form.Item
                label="?????????????? ??????????????"
                labelCol={{ span: 11 }}
                className="w-1/2"
              >
                <Controller
                  name="lieuTravail"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>
            </div>
            <Form.Item
                label="?????????? ???????????????? "
                
                labelCol={{ span: 5 }}
              >
                <DatePicker
                  className="w-full"
                  onChange={(e) => {
                    if (e) {
                      setValue("dateDebutAbonnement", e.format(DATE_FORMAT));
                    }
                  }}
                />
              </Form.Item>
            <div className="flex flex-row gap-2">
            <Form.Item label="??????????" className="w-1/2">
                <Controller
                  name="ville"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>
              <Form.Item label="?????????? ????????????" className="w-1/2">
                <Controller
                  name="anneeTravail"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>
          
            </div>
            <Form.Item required label="???????? ????????????????" labelCol={{ span: 0 }}>
              <Controller
                name="isPaid"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <Radio.Group {...field}>
                    <Radio value={false}>????</Radio>
                    <Radio value={true}>??????</Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>

           
          </div>
        </div>
      </Modal>
    </>
  );
};

{
  /* <Form.Item label="?????? ????????????" required labelCol={{ span: 5 }}>
<Select
  optionFilterProp="children"
  onChange={(value) => setValue("categorieIdAdult", value)}
  tagRender={(props) => <Tag color="blue" {...props} />}
  loading={gettingCat}
  options={categories?.map((c) => ({ label: c.name, value: c.id }))}
/>
  </Form.Item> 
 */
}

{/* <Form.Item label="?????? ????????????" required labelCol={{ span: 5 }}>
<Select
  optionFilterProp="children"
  maxTagCount={"responsive"}
  mode={"multiple"}
  onChange={(value) => setValue("servicesId", value)}
  loading={gettingService}
  options={services?.map((c) => ({
    label: c.activite,
    value: c.id,
  }))}
/>
</Form.Item> */}

const ShowDialog = ({
 
  membre,
  onClose,
  open,
}: {
  onClose: () => void;
  open: boolean;
  membre: Adherent | undefined;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
    watch,
    
  } = useForm<TMember>();

  useEffect(() => {
    if (membre) {
      setValue("name", membre.name);
      setValue("email", membre.email || "");
      setValue("tel", membre.tel || undefined);
      setValue("sexe", membre.sexe || "M");
      setValue("dateNaissance", membre.dateNaissance || undefined);
      setValue("lieuNaissance", membre.lieuNaissance || undefined);
      setValue("familyStatus", membre.familyStatus || "C");
      setValue("childrenNumber", membre.childrenNumber || undefined);
      setValue("profession", membre.profession || undefined);
      setValue("lieuTravail", membre.lieuTravail || undefined);
      setValue("cin", membre.cin || "");
      setValue("ville", membre.ville || undefined);
      setValue("identifiant", membre.identifiant || undefined);
      setValue("identifiant2", membre.identifiant2 || undefined);
      setValue("anneeTravail", membre.anneeTravail || undefined);
      setValue("isPaid", membre.isPaid);
      setValue("photoId", membre.photoId || undefined);
      //FixMe: fix date
      setValue("dateDebutAbonnement", membre.dateDebutAbonnement || "");
      setValue("sifa", membre.sifa || "P");

    }
  }, [membre, setValue]);


  const handleCancel = () => {
    onClose();
  };

 
  return (
    <>
      <Modal
       
        open={open}
        destroyOnClose={true}
        width={900}
        className="h-screen w-screen"
        onCancel={handleCancel}
        okButtonProps={{ hidden: true }}
        cancelButtonProps={{hidden:true}}
        footer={null}
      >
        <div className="flex flex-row gap-6">
          <div className="w-1/2 space-y-3 py-6">
            <Form.Item label="????????" required labelCol={{ span: 7 }}>
               <AdvancedImage
                    cldImg={cloudy
                      .image(
                       watch("photoId")
                          ? watch("photoId")
                          : watch("sexe") == "F"
                          ? "placeholder_female"
                          : "placeholder_male"
                      )
                      .resize(thumbnail().width(150))}
                    plugins={[
                      lazyload(),
                      responsive(),
                      accessibility(),
                      placeholder(),
                    ]}
                  />
            </Form.Item>
            <Form.Item label="?????????? ???????????? " required labelCol={{ span: 7 }}>
              <Controller
                name="name"
                
                defaultValue=""
                control={control}
                render={({ field }) => (
                  <Input status={errors.name && "error"} {...field} onChange={(e)=>{
                    console.log("")
                  }} />
                )}
              />
            </Form.Item>
            <Form.Item label="??????????" labelCol={{ span: 7 }}>
              <Controller
                name="sexe"
                control={control}
                defaultValue={"M"}
                render={({ field }) => (
                  <Radio.Group {...field} onChange={(e)=>{
                    console.log("")
                  }} >
                    <Radio value={"M"}>??????</Radio>
                    <Radio value={"F"}>????????</Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>
            <Form.Item
              label="???????????? ????????????????????"
              required
              labelCol={{ span: 7 }}
            >
              <Controller
                name="email"
                defaultValue=""
                control={control}
                
                render={({ field }) => <Input type="email" {...field} onChange={(e)=>{
                  console.log("")
                }}/>}
              />
            </Form.Item>

            <Form.Item label="????????????" labelCol={{ span: 7 }}>
              <Controller
                name="tel"
                defaultValue=""
                control={control}
                render={({ field }) => <Input type="number" {...field} onChange={(e)=>{
                  console.log("")
                }}/>}
              />
            </Form.Item>
            <Form.Item label="?????????????? ????????????????????" labelCol={{ span: 7 }}>
              <Controller
                name="familyStatus"
                control={control}
                defaultValue="C"
                render={({ field }) => (
                  <Radio.Group {...field} onChange={(e)=>{
                    console.log("")
                  }}>
                    <Radio value={"C"}>????????</Radio>
                    <Radio value={"M"}>??????????</Radio>
                    <Radio value={"D"}>????????</Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>

            <Form.Item
              required={watch("familyStatus") != "C"}
              label="?????? ??????????????"
              labelCol={{ span: 7 }}
            >
              <Controller
                name="childrenNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    disabled={watch("familyStatus") == "C"}
                    type="number"
                    {...field}
                    onChange={(e) =>
                     console.log("")
                    }
                  />
                )}
              />
            </Form.Item>
            <Form.Item label="?????????? ??????????????" labelCol={{ span: 7 }}>
              <DatePicker
                className="w-full"
                disabled
                // value={dayjs}// Dayjswatch("dateNaissance")}
                onChange={(e) =>
                  console.log("")
                 }
              />
            </Form.Item>
            <Form.Item label="???????? ????????????????" labelCol={{ span: 7 }}>
              <Controller
                name="lieuNaissance"
                defaultValue=""
                control={control}
                render={({ field }) => <Input {...field}   onChange={(e) =>
                  console.log("")
                 }/>}
              />
            </Form.Item>
          </div>

          <Divider type="vertical" className="h-auto" />

          <div className="w-1/2 py-6">
            <Form.Item label="?????? ?????????????? ??????????????" required>
              <Controller
                name="cin"
                defaultValue=""
                control={control}
                render={({ field }) => <Input {...field}   onChange={(e) =>
                  console.log("")
                 }/>}
              />
            </Form.Item>
            <Form.Item label="??????????" labelCol={{ span: 0 }}>
                <Controller
                  name="sifa"
                  control={control}
                  defaultValue="P"
                  render={({ field }) => (
                    <Radio.Group {...field}   onChange={(e) =>
                      console.log("")
                     }>
                      <Radio value={"A"}>??????????</Radio>
                      <Radio value={"P"}>????????</Radio>
                    </Radio.Group>
                  )}
                />
              </Form.Item>
            <div className="flex flex-row gap-2">
            <Form.Item label="?????? ?????????? ??????????????">
                <Controller
                  name="identifiant2"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field}   onChange={(e) =>
                    console.log("")
                   }/>}
                />
              </Form.Item>
              <Form.Item label="?????? ?????????? ??????????????">
                <Controller
                  name="identifiant"
                  defaultValue=""
                  
                 
                  control={control}
                  render={({ field }) => <Input   {...field}   onChange={(e) =>
                    console.log("")
                   }/>}
                />
              </Form.Item>
            </div>

            <div className="flex flex-row gap-2">
              <Form.Item label="????????????" className="w-1/2">
                <Controller
                  name="profession"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field}   onChange={(e) =>
                    console.log("")
                   }/>}
                />
              </Form.Item>
              <Form.Item
                label="?????????????? ??????????????"
                labelCol={{ span: 11 }}
                className="w-1/2"
              >
                <Controller
                  name="lieuTravail"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field}   onChange={(e) =>
                    console.log("")
                   }/>}
                />
              </Form.Item>
            </div>
            <Form.Item
                label="?????????? ???????????????? "
                
                labelCol={{ span: 5 }}
              >
                <DatePicker
                  className="w-full"
                  disabled
                  onChange={(e) =>
                    console.log("")
                   }
                />
              </Form.Item>
            <div className="flex flex-row gap-2">
            <Form.Item label="??????????" className="w-1/2">
                <Controller
                  name="ville"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field}   onChange={(e) =>
                    console.log("")
                   }/>}
                />
              </Form.Item>
              <Form.Item label="?????????? ????????????" className="w-1/2">
                <Controller
                  name="anneeTravail"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field}   onChange={(e) =>
                    console.log("")
                   }/>}
                />
              </Form.Item>
           
            </div>
            <Form.Item required label="???????? ????????????????" labelCol={{ span: 0 }}>
              <Controller
                name="isPaid"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <Radio.Group {...field}   onChange={(e) =>
                    console.log("")
                   }>
                    <Radio value={false}>????</Radio>
                    <Radio value={true}>??????</Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>

           
          </div>
        </div>
      </Modal>
    </>
  );
};