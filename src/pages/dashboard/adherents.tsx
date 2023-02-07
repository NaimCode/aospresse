/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useEffect, useState } from "react";
import DashboardLayout from "@ui/dashboardLayout";
import { api } from "@utils/api";
import type { Adherent, Service, User } from "@prisma/client";
import { type ColumnsType } from "antd/lib/table";
import MyTable, { ActionTable } from "@ui/components/table";
import moment from "moment";
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
import { PlusOutlined } from "@ant-design/icons";
import type { GetServerSideProps } from "next";
import { getServerAuthSession } from "@server/auth";
import Search from "antd/lib/input/Search";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";

import toast from "react-hot-toast";
import ExportButton from "@ui/exportButton";
import MyUpload from "@ui/myUpload";
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

  const columns: ColumnsType<Adherent> = [];

  const filter = (v: string) => {
    if (data) {
      if (!v) {
        setDataFilter(data || []);
        return;
      }
      const newData = (data || []).filter((d) => {
        return true;
      });
      setDataFilter(newData || []);
    }
  };
  return (
    <DashboardLayout>
      <div className="flex w-full flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-700">
          انشطة وخدمات الجمعية
        </h1>
        <div className={""}>
          <div className={"flex flex-row-reverse items-center gap-6 py-6 "}>
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
                return {};
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
  );
};

export default Services;

type TMember = {
  name: string;
  email: string;
  sexe: "M" | "F";
  dateNaissance?: string;
  lieuNaissance?: string;
  familyStatus: "C" | "M";
  children?: number;
  tel?: string;
  profession?: string;
  lieuTravail?: string;
  cin: string;
  identifiant?: string;
  anneeTravail?: string;
  isPaid: boolean;
  dateDebutAbonnement?: string;
  dateNouvelAbonnement?: string;
  services: Service[];
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

  useEffect(() => {
    if (membre) {
      setIsModalOpen(true);
      setValue("name", membre.name);
      setValue("email", membre.email);
      setValue("tel", membre.tel || undefined);
      setValue("sexe", membre.sexe);
      setValue("dateNaissance", membre.dateNaissance || undefined);
      setValue("lieuNaissance", membre.lieuNaissance || undefined);
      setValue("familyStatus", membre.familyStatus);
      setValue("children", membre.children || undefined);
      setValue("profession", membre.profession || undefined);
      setValue("lieuTravail", membre.lieuTravail || undefined);
      setValue("cin", membre.cin);
      setValue("identifiant", membre.identifiant || undefined);
      setValue("anneeTravail", membre.anneeTravail || undefined);
      setValue("isPaid", membre.isPaid);
      setValue("dateDebutAbonnement", membre.dateDebutAbonnement || undefined);
      setValue(
        "dateNouvelAbonnement",
        membre.dateNouvelAbonnement || undefined
      );
      setValue("services", (membre as any).services);
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
    if (
      !data.name ||
      !data.email ||
      !data.sexe ||
      !data.familyStatus ||
      !data.cin
    ) {
      toast.error("يجب ملئ جميع الحقول");
      return;
    }

    if (membre)
      update({
        id: membre.id,
        name: data.name,
        email: data.email,
        sexe: data.sexe,
        dateNaissance: data.dateNaissance,
        lieuNaissance: data.lieuNaissance,
        familyStatus: data.familyStatus,
        children: data.children,
        tel: data.tel,
        profession: data.profession,
        lieuTravail: data.lieuTravail,
        cin: data.cin,
        identifiant: data.identifiant,
        anneeTravail: data.anneeTravail,
        isPaid: data.isPaid,
        dateDebutAbonnement: data.dateDebutAbonnement,
        dateNouvelAbonnement: data.dateNouvelAbonnement,
        services: data.services,
      });
    else
      add({
        name: data.name,
        email: data.email,
        sexe: data.sexe,
        dateNaissance: data.dateNaissance,
        lieuNaissance: data.lieuNaissance,
        familyStatus: data.familyStatus,
        children: data.children,
        tel: data.tel,
        profession: data.profession,
        lieuTravail: data.lieuTravail,
        cin: data.cin,
        identifiant: data.identifiant,
        anneeTravail: data.anneeTravail,
        isPaid: data.isPaid,
        dateDebutAbonnement: data.dateDebutAbonnement,
        dateNouvelAbonnement: data.dateNouvelAbonnement,
        services: data.services,
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
        className="w-screen h-screen"
        onCancel={handleCancel}
      >
        <div className="flex flex-row gap-6">
          <div className="w-1/2 space-y-3 py-6">
          <Form.Item label="الجنس" required labelCol={{ span: 7 }}>
            <MyUpload/>
          </Form.Item>
            <Form.Item label="صورة" required labelCol={{ span: 7 }}>
              <Controller
                name="name"
                
                defaultValue=""
                control={control}
                render={({ field }) => <Input status={errors.name&&"error"} {...field} />}
              />
            </Form.Item>
            <Form.Item label="الجنس" labelCol={{ span: 7 }}>
              <Controller
                name="sexe"
                control={control}
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
                name="children"
                control={control}
                render={({ field }) => (
                  <Input
                    disabled={watch("familyStatus") == "C"}
                    type="number"
                    {...field}
                  />
                )}
              />
            </Form.Item>
            <Form.Item label="للاطفال" labelCol={{ span: 7 }}>
              <DatePicker
                className="w-full"
                onChange={(e) =>
                  setValue("dateNaissance", e?.format("dd-mm-yyyy"))
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
            <div className="flex flex-row gap-2">
              <Form.Item label="رقم البطاقة الوطنية" required>
                <Controller
                  name="cin"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field} />}
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
              <Form.Item label="سنة من الخبرة" className="w-1/2">
                <Controller
                  name="anneeTravail"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>
              <Form.Item
                label="مكان الازدياد"
                labelCol={{ span: 9 }}
                className="w-1/2"
              >
                <Controller
                  name="lieuNaissance"
                  defaultValue=""
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>
            </div>

            <div className="flex flex-row gap-2">
              <Form.Item label="تاريخ الانخراط " className="w-1/2" labelCol={{ span: 10 }}>
                <DatePicker
                  className="w-full"
                  onChange={(e) =>
                    setValue("dateDebutAbonnement", e?.format("dd-mm-yyyy"))
                  }
                />
              </Form.Item>
              <Form.Item
                label="تاريخ اعادة الانخراط"
                labelCol={{ span: 14 }}
                className="w-1/2"
              >
                <DatePicker
                  className="w-full"
                  onChange={(e) =>
                    setValue("dateNouvelAbonnement", e?.format("dd-mm-yyyy"))
                  }
                />
              </Form.Item>
            </div>
            <Form.Item
              required
              label="الوضعية الاجتماعية"
              labelCol={{ span: 7 }}
            >
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
                
                onChange={(value) =>
                  setValue(
                    "services",
                    value.map((v: string) => {
                      return { id: v };
                    })
                  )
                }
                tagRender={(props) => <Tag color="blue" {...props} />}
                loading={gettingService}
                options={services?.map((c) => ({
                  label: c.forChild + " | " + c.forAdult,
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
</Form.Item>  */
}
