/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useEffect, useState } from "react";
import DashboardLayout from "@ui/dashboardLayout";
import { api } from "@utils/api";
import type { Service, User } from "@prisma/client";
import { type ColumnsType } from "antd/lib/table";
import MyTable, { ActionTable } from "@ui/components/table";
import moment from "moment";
import { Button, Divider, Form, Input, Modal, Radio, Select, Tag } from "antd";
import { PlusOutlined, CheckCircleTwoTone,CloseCircleTwoTone } from "@ant-design/icons";
import type { GetServerSideProps } from "next";
import { getServerAuthSession } from "@server/auth";
import Search from "antd/lib/input/Search";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";

import toast from "react-hot-toast";
import ExportButton from "@ui/exportButton";
import TextArea from "antd/lib/input/TextArea";
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
  const [updateMembre, setupdateMembre] = useState<Service | undefined>(
    undefined
  );
  const [dataFilter, setDataFilter] = useState<Service[]>([]);
  const { data, isLoading, refetch } = api.service.getAll.useQuery(undefined, {
    onSuccess(data) {
      setDataFilter(data);
    },
  });
  const { mutate: deleteMember } = api.service.delete.useMutation({
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

  const columns: ColumnsType<Service> = [
    {
      title: "النشاط",
      width: 200,
      dataIndex: "activite",
      key: "activite",
      render: (v) =>  <span className={"text-md font-bold"}>{v}</span>,
    },
    {
      title: "الوصف",
      dataIndex: "category",
      width: 100,
      align:"center",
      key: "category",
      render: (v) => <Tag color={v.color||"default"}>{v.name}</Tag>,
    },

    {
      title: "للاطفال",
      dataIndex: "forChild",
      key: "forChild",
      align:"center",
      render: (v) => (v ? <CheckCircleTwoTone /> : <CloseCircleTwoTone />),
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
        return (
          d.activite.toLowerCase().includes(v.toLowerCase()) ||
          (d.description || "").toLowerCase().includes(v.toLowerCase())
        );
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
                return {
                  النشاط: d.activite,
                  الوصف: d.description,
                  للاطفال: d.forChild ? "نعم" : "لا",
                  "": "",
                  "تاريخ الإنشاء": moment(d.createdAt).format(DATE_FORMAT),
                  "تاريخ التعديل": moment(d.updatedAt).format(DATE_FORMAT),
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
  );
};

export default Services;

type TMember = {
  forChild: boolean;
  activite: string;
  description?: string;
  categoryId: string;
};
const AddMemberDialog = ({
  onAdd,
  membre,
  onClose,
}: {
  onAdd: () => void;
  onClose: () => void;
  membre: Service | undefined;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
  } = useForm<TMember>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (membre) {
      setIsModalOpen(true);
      setValue("activite", membre.activite);
      setValue("description", membre.description || undefined);
      setValue("forChild", membre.forChild);
      setValue("categoryId", membre.categoryId);
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
  const { mutate: add, isLoading } = api.service.add.useMutation({
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
    api.service.update.useMutation({
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
    if (!data.activite) {
      toast.error("يجب ملئ جميع الحقول");
      return;
    }

    if (membre)
      update({
        id: membre.id,
        forChild: data.forChild,
        activite: data.activite,
        description: data.description,
        categoryId: data.categoryId,
      });
    else
      add({
        forChild: data.forChild,
        activite: data.activite,
        description: data.description,
        categoryId: data.categoryId,
      });
  };

  const { data: categories, isLoading: gettingCat } =
    api.category.getAll.useQuery();
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
        onCancel={handleCancel}
      >
        <div className="space-y-3 py-6">
          <Form.Item label="النشاط" required labelCol={{ span: 5 }}>
            <Controller
              name="activite"
              defaultValue=""
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>
          <Form.Item label="وصف"  labelCol={{ span: 5 }}>
            <Controller
              name="description"
              defaultValue=""
              control={control}
              render={({ field }) => <TextArea rows={4} {...field} />}
            />
          </Form.Item>
          <Form.Item label="نوع النشاط" required labelCol={{ span: 5 }}>
            <Select
              // showSearch
              // style={{ width: 200 }}
              optionFilterProp="children"
              onChange={(value) => setValue("categoryId", value)}
              loading={gettingCat}
              options={categories?.map((c) => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>
          <Form.Item required label="للاطفال" labelCol={{ span: 7 }}>
            <Controller
              name="forChild"
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
        </div>
      </Modal>
    </>
  );
};
