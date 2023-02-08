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

import * as XLSX from "xlsx";
import { fill, scale, thumbnail } from "@cloudinary/url-gen/actions/resize";
import {
  Button,
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
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
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
  const [dataFilter, setDataFilter] = useState<Adherent[]>([]);
  const { data, isLoading, refetch } = api.adherent.getAll.useQuery(undefined, {
    onSuccess(data) {
      setDataFilter(data);
    },
  });
  const { mutate: deleteMember } = api.adherent.delete.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("تم حذف العضو بنجاح");
      void refetch();
    },
    onError: () => {
      toast.dismiss();
      toast.error("حدث خطأ ما");
    },
    onMutate: () => {
      toast.loading("جاري حذف العضو");
    },
  });

  const columns: ColumnsType<Adherent> = [
    {
      title: "الإسم الكامل",

      dataIndex: "photoId",
      key: "photoId",
      render: (v,a) => (
        <AdvancedImage
          cldImg={cloudy.image(v?v:a.sexe=="F"?"placeholder_female":"placeholder_male").resize(thumbnail().width(50))}
          plugins={[lazyload(), responsive(), accessibility(), placeholder()]}
        />
      ),
    },
    {
      title: "الإسم الكامل",
      dataIndex: "name",
      key: "name",
      render: (v) => <span className={"text-md font-bold"}>{v}</span>,
    },
    {
      title: "الجنس",
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
      title: "البريد الالكتروني",

      dataIndex: "email",
      key: "email",
      render: (v) => <span className={"font-ligh text-sm italic"}>{v}</span>,
    },
    {
      title: "تاريخ الإنشاء",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => (
        <span className={"text-[12px] opacity-60"}>
          {moment(v).format(DATE_FORMAT)}
        </span>
      ),
    },
    {
      title: "تاريخ التعديل",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (v) => (
        <span className={"text-[12px] opacity-60"}>
          {moment(v).format(DATE_FORMAT)}
        </span>
      ),
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
          }}
          onDelete={() => {
            deleteMember({ id: d.id });
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
        return d.name.includes(v)||(d.email||"").includes(v)

      })
      setDataFilter(newData || []);
    }
  };

  const fileRef = useRef<HTMLInputElement>(null);
  const onPickfile = () => fileRef.current?.click();
  const { mutate: importAdherent, isLoading: uploadingAdherent } =
    api.adherent.import.useMutation({
      onSuccess: () => {
        toast.dismiss();
        toast.success("تم إضافة العضو بنجاح");
        void refetch();
      },
      onError: () => {
        toast.dismiss();
        toast.error("حدث خطأ ما");
      },
      onMutate: () => {
        toast.loading("جاري إضافة العضو");
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
          function familyStatus(v:string|undefined):"C"|"M"|"D"|undefined{
            if(v===undefined)  return undefined
              if(v.includes("أعزب")) return "C"
               if(v.includes("متزوج")) return "M"
                 if(v.includes("مطلق")) return "D"
  
                 return undefined
             }
  
             function sifa(v:string|undefined):"A"|"P"|undefined{
              if(v===undefined)  return undefined
              if(v.includes("مهني")) return "P"
              else return "A"
  
             }

             function stringToInt(v:string|undefined|number):number|undefined{
              if(v===undefined)  return undefined
              if(typeof v === "number") return v
              return parseInt(v)
             }
          importAdherent(
            lines.map((l: any,i:number) => {
          
              const obj={
                name: l["النسب\n"]+" "+l["الاسم\n"],
                sexe: l["الجنس"]&& l["الجنس"] === "انثى" ? "F" : "M",
                familyStatus:familyStatus(l["الوضعية الاجتماعية"]),
                email: l["بريد الالكتروني"],
                childrenNumber:stringToInt(l["عدد الاطفال"]),
                identifiant:l["رقم بطاقة الصحافة"],
                anneeTravail:l['عدد سنوات العمل'],
                sifa:sifa(l["نوع"]),
                lieuTravail:l["المؤسسة"],
                createdAt:l["تاريخ التسجيل"]&& moment(l["تاريخ التسجيل"]).toDate().toISOString(),
                dateNouvelAbonnement:l["تاريخ انتهاء الصلاحية"],
                dateDebutAbonnement:l["تاريخ اعادة التسجيل"],
                isPaid:l["مدفوع"] && l["مدفوع"]==="نعم"?true:false,
                tel: l["هاتف"],
                address:l["عنوان"],
                 num: stringToInt(l["رقم التسجيل"])
                //مكان الازدياد
                //تاريخ الازدياد
                //رقم بطاقة النقابة
              
              };
              if(i==0){
                console.log(Object.keys(data[0]))
              }
              return obj
            })
          );
          console.log("data", data);
         
          //
        }
      };
      reader.readAsBinaryString(file);
    }
  };
  return (
    <>
    <CardAdherent/>
    <DashboardLayout>
      <div className="flex w-full flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-700">
          انشطة وخدمات الجمعية
        </h1>
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
              placeholder="اكتب بحثك"
              allowClear
              enterButton="ابحاث"
              size="large"
              className={"w-[300px]"}
              onSearch={filter}
            />
            <div className={"flex-grow"}></div>

            <ExportButton
              tableName={"انشطة وخدمات الجمعية"}
              data={dataFilter.map((d) => {
                return {
                  "الاسم":d.name,
                  "الجنس":d.sexe=="M"?"ذكر":"انثى",
                  "الوضعية الاجتماعية":d.familyStatus=="C"?"أعزب":d.familyStatus=="M"?"متزوج":"مطلق",
                  "البريد الالكتروني":d.email,
                  "عدد الاطفال":d.childrenNumber,
                  "رقم بطاقة الصحافة":d.identifiant,
                  "عدد سنوات العمل":d.anneeTravail,
                  "نوع":d.sifa=="A"?"عام":"مهني",
                  "المؤسسة":d.lieuTravail,
                  "تاريخ التسجيل":d.createdAt,
                  "تاريخ انتهاء الصلاحية":d.dateNouvelAbonnement,
                  "تاريخ اعادة التسجيل":d.dateDebutAbonnement,
                  "مدفوع":d.isPaid?"نعم":"لا",
                  "هاتف":d.tel,
                  "عنوان":d.address,
                  "رقم التسجيل":d.num

                };
              })}
            />
          </div>

          <MyTable
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




const CardAdherent = () => {
  return <div className="fixed top-0 left-0 w-screen h-screen bg-black/70 z-[10000]">

  </div>
}





type TMember = {
  name: string;
  email?: string;
  sexe: "M" | "F";
  dateNaissance?: string;
  lieuNaissance?: string;
  familyStatus: "C" | "M" | "D";
  sifa: "A" | "P";
  childrenNumber?: number;
  tel?: string;
  profession?: string;
  lieuTravail?: string;
  cin?: string;
  identifiant?: string;
  anneeTravail?: string;
  isPaid: boolean;
  dateDebutAbonnement: string;
  servicesId: string[];
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
      setValue("email", membre.email||"");
      setValue("tel", membre.tel || undefined);
      setValue("sexe", membre.sexe || "M");
      setValue("dateNaissance", membre.dateNaissance || undefined);
      setValue("lieuNaissance", membre.lieuNaissance || undefined);
      setValue("familyStatus", membre.familyStatus || "C");
      setValue("childrenNumber", membre.childrenNumber || undefined);
      setValue("profession", membre.profession || undefined);
      setValue("lieuTravail", membre.lieuTravail || undefined);
      setValue("cin", membre.cin || "");
      setValue("identifiant", membre.identifiant || undefined);
      setValue("anneeTravail", membre.anneeTravail || undefined);
      setValue("isPaid", membre.isPaid);
      setValue("photoId", membre.photoId || undefined);
      //FixMe: fix date
      setValue("dateDebutAbonnement", membre.dateDebutAbonnement || "");
      setValue("sifa", membre.sifa || "P");

      setValue("servicesId", (membre as any).services);
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
      toast.success("تمت الإضافة بنجاح");
      setIsModalOpen(false);
      onAdd();
    },
    onError: (e) => {
      console.log(e);
      toast.error("حدث خطأ");
    },
  });

  const { mutate: update, isLoading: updateLoading } =
    api.adherent.update.useMutation({
      onSuccess: () => {
        toast.success("تم التحديث بنجاح");
        setIsModalOpen(false);
        onAdd();
      },
      onError: (e) => {
        console.log(e);
        toast.error("حدث خطأ");
      },
    });

  const onSubmit: SubmitHandler<TMember> = (data: TMember) => {
    if (uploading) {
      toast.error("يجب انتظار انتهاء رفع الصورة");
      return;
    }
    if (
      !data.name ||
      !data.sexe 
    ) {
      toast.error("يجب ملئ جميع الحقول");
      return;
    }
    if (!data.photoId) {
      toast.error("يجب اضافة صورة");
      return;
    }
    if (membre)
      update({
        id: membre.id,
        name: data.name,
        email: data.email||"",
        sexe: data.sexe,
        dateNaissance: data.dateNaissance,
        lieuNaissance: data.lieuNaissance,
        familyStatus: data.familyStatus,
        childrenNumber: data.childrenNumber,
        tel: data.tel,
        profession: data.profession,
        lieuTravail: data.lieuTravail,
        cin: data.cin||"",
        identifiant: data.identifiant,
        anneeTravail: data.anneeTravail,
        isPaid: data.isPaid,
        sifa: data.sifa,
        photoId: data.photoId,
        dateDebutAbonnement: data.dateDebutAbonnement,
        servicesId: data.servicesId,
      });
    else
      add({
        name: data.name,
        email: data.email||"",
        sexe: data.sexe,
        dateNaissance: data.dateNaissance,
        lieuNaissance: data.lieuNaissance,
        familyStatus: data.familyStatus,
        childrenNumber: data.childrenNumber,
        tel: data.tel,
        profession: data.profession,
        lieuTravail: data.lieuTravail,
        cin: data.cin||"",
        identifiant: data.identifiant,
        anneeTravail: data.anneeTravail,
        isPaid: data.isPaid,
        dateDebutAbonnement: data.dateDebutAbonnement,
        sifa: data.sifa,
        photoId: data.photoId,
        servicesId: data.servicesId,
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
        يضيف
      </Button>
      <Modal
        title={membre ? "تعديل الخدمة" : "أضف الخدمة"}
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
            <Form.Item label="صورة" required labelCol={{ span: 7 }}>
              <MyUpload
                onSuccess={(key: string) => setValue("photoId", key)}
                isUploading={uploading}
                setUploading={(b: boolean) => setUploading(b)}
              />
            </Form.Item>
            <Form.Item label="الإسم الكامل " required labelCol={{ span: 7 }}>
              <Controller
                name="name"
                defaultValue=""
                control={control}
                render={({ field }) => (
                  <Input status={errors.name && "error"} {...field} />
                )}
              />
            </Form.Item>
            <Form.Item label="الجنس" labelCol={{ span: 7 }}>
              <Controller
                name="sexe"
                control={control}
                defaultValue={"M"}
                render={({ field }) => (
                  <Radio.Group {...field}>
                    <Radio value={"M"}>ذكر</Radio>
                    <Radio value={"F"}>أنثى</Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>
            <Form.Item
              label="البريد الالكتروني"
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

            <Form.Item label="الهاتف" labelCol={{ span: 7 }}>
              <Controller
                name="tel"
                defaultValue=""
                control={control}
                render={({ field }) => <Input type="number" {...field} />}
              />
            </Form.Item>
            <Form.Item label="الوضعية الاجتماعية" labelCol={{ span: 7 }}>
              <Controller
                name="familyStatus"
                control={control}
                defaultValue="C"
                render={({ field }) => (
                  <Radio.Group {...field}>
                    <Radio value={"C"}>عازب</Radio>
                    <Radio value={"M"}>متزوج</Radio>
                    <Radio value={"D"}>مطلق</Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>

            <Form.Item
              required={watch("familyStatus") != "C"}
              label="عدد الأطفال"
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
            <Form.Item label="تاريخ الميلاد" labelCol={{ span: 7 }}>
              <DatePicker
                className="w-full"
                // value={dayjs}// Dayjswatch("dateNaissance")}
                onChange={(e) =>
                  setValue("dateNaissance", e?.format(DATE_FORMAT))
                }
              />
            </Form.Item>
            <Form.Item label="مكان الازدياد" labelCol={{ span: 7 }}>
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
            <Form.Item label="رقم البطاقة الوطنية" required>
              <Controller
                name="cin"
                defaultValue=""
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
            <div className="flex flex-row gap-2">
              <Form.Item label="الصفة" labelCol={{ span: 0 }}>
                <Controller
                  name="sifa"
                  control={control}
                  defaultValue="P"
                  render={({ field }) => (
                    <Radio.Group {...field}>
                      <Radio value={"A"}>منتسب</Radio>
                      <Radio value={"P"}>مهني</Radio>
                    </Radio.Group>
                  )}
                />
              </Form.Item>
              <Form.Item label="رقم بطاقة الصحافة / النقابة">
                <Controller
                  name="identifiant"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>
            </div>

            <div className="flex flex-row gap-2">
              <Form.Item label="المهنة" className="w-1/2">
                <Controller
                  name="profession"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>
              <Form.Item
                label="المؤسسة المشغلة"
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

            <div className="flex flex-row gap-2">
              <Form.Item label="سنوات الخبرة" className="w-1/2">
                <Controller
                  name="anneeTravail"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>
              <Form.Item
                label="تاريخ الانخراط "
                className="w-1/2"
                labelCol={{ span: 10 }}
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
            </div>
            <Form.Item required label="واجب الانخراط" labelCol={{ span: 0 }}>
              <Controller
                name="isPaid"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <Radio.Group {...field}>
                    <Radio value={false}>لا</Radio>
                    <Radio value={true}>نعم</Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>

            <Form.Item label="نوع النشاط" required labelCol={{ span: 5 }}>
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
            </Form.Item>
          </div>
        </div>
      </Modal>
    </>
  );
};

{
  /* <Form.Item label="نوع النشاط" required labelCol={{ span: 5 }}>
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
