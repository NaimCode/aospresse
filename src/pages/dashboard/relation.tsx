/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "@ui/dashboardLayout";
import { api } from "@utils/api";
import { Adherent, Relation, type Category } from "@prisma/client";
import { type ColumnsType } from "antd/lib/table";
import MyTable, { ActionTable } from "@ui/components/table";
import moment from "moment";
import { Button, Form, Input, Modal, Select, Switch } from "antd";
import { PlusOutlined, CheckOutlined } from "@ant-design/icons";
import type { GetServerSideProps } from "next";
import { getServerAuthSession } from "@server/auth";

import { useForm, Controller, type SubmitHandler } from "react-hook-form";

import toast from "react-hot-toast";
import TextArea from "antd/lib/input/TextArea";
import { COLORS } from "@data/index";
import cx from "classnames";
import Search from "antd/lib/input/Search";

import ExportButton from "@ui/exportButton";
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

const Relation = () => {
  const [updateitem, setupdateitem] = useState<Relation | undefined>(undefined);
  const { data, isLoading, refetch } = api.relation.getAll.useQuery(undefined, {
    onSuccess(data) {
      setDataFilter(data);
    },
  });
  const { mutate: deleteIt } = api.relation.delete.useMutation({
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

  const columns: ColumnsType<Relation> = [
    {
      title: "عضو",
      dataIndex: "adherent",
      key: "adherent",
      render: (v) => <span className={"text-md font-bold"}>{v.name}</span>,
    },
    {
      title: "خدمة",
      dataIndex: "service",
      key: "service",
      render: (v) => v.activite,
    },
    {
      title: "المبلغ",
      dataIndex: "montant",
      key: "montant",
    },
    {
      title: "تعليق",
      dataIndex: "description",
      key: "description",
      width: 400,
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
        render: (v) => <span className={"opacity-60 text-[12px]"}>{moment(v).format(DATE_FORMAT)}</span>,
    },
    {
      title: "",
      dataIndex: "action",
      key: "action",
      render: (_, d) => (
        <ActionTable
          onEdit={() => {
            setupdateitem(d);
          }}
          onDelete={() => {
            deleteIt({ id: d.id });
          }}
        />
      ),
    },
  ];
  const [dataFilter, setDataFilter] = useState<Relation[]>([]);

  const filter = (v: string) => {
    if (data) {
      if (!v) {
        setDataFilter(data || []);
        return;
      }
      const newData = data?.filter(
        (d) =>
          d.description?.includes(v) ||
          d.montant.includes(v) ||
          d.adherent.name.includes(v) ||
          d.service.activite.includes(v)
      );
      setDataFilter(newData || []);
    }
  };
  const componentRef = useRef<HTMLDivElement>(null);

  return (
    <DashboardLayout>
      <div className="flex w-full flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-700">خدمات المنخرطين</h1>
        <div className={""}>
          <div className={"flex flex-row-reverse items-center gap-6 py-6 "}>
            <MyDialog
              onAdd={() => refetch()}
              item={updateitem}
              onClose={() => setupdateitem(undefined)}
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
              data={dataFilter.map((d) => {
                return {
                  العضو: (d as any).adherent.name,
                  الخدمة: (d as any).service.activite,
                  المبلغ: d.montant,
                  التعليق: d.description,
                  "تاريخ الإنشاء": moment(d.createdAt).format(DATE_FORMAT),
                  "تاريخ التعديل": moment(d.updatedAt).format(DATE_FORMAT),
                };
              })}
              tableName={"إدارة الفئة"}
            />
          </div>

          <div ref={componentRef}>
            <MyTable
              loading={isLoading}
              data={dataFilter || []}
              // xScroll={1000}

              columns={columns as any}
              // columns={columns.filter((c)=>options.includes(c.key))}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Relation;

type TCategory = {
  adherentId: string;
  serviceId: string;
  montant: string;
  description?: string;
};
const MyDialog = ({
  onAdd,
  item,
  onClose,
}: {
  onAdd: () => void;
  onClose: () => void;
  item: Relation | undefined;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<TCategory>({
    defaultValues: {},
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasColor, setHasColor] = useState(true);
  useEffect(() => {
    if (item) {
      setIsModalOpen(true);
      setValue("serviceId", item.serviceId);
      setValue("adherentId", item.adherentId);
      setValue("montant", item.montant);
      setValue("description", item.description || undefined);
    }
  }, [item, setValue]);

  const showModal = () => {
    setIsModalOpen(true);
    reset();
    onClose();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    onClose();
  };

  const handleOk = () => handleSubmit(onSubmit)();
  const { mutate: add, isLoading } = api.relation.add.useMutation({
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
    api.relation.update.useMutation({
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

  const onSubmit: SubmitHandler<TCategory> = (data: TCategory) => {
    if (errors.serviceId || errors.adherentId || errors.montant) {
      toast.error("يجب ملئ جميع الحقول");
      return;
    }

    if (item)
      update({
        id: item.id,
        adherentId: data.adherentId,
        serviceId: data.serviceId,
        montant: data.montant,
        description: data.description,
      });
    else
      add({
        adherentId: data.adherentId,
        serviceId: data.serviceId,
        montant: data.montant,
        description: data.description,
      });
  };
  const { data: adherents, isLoading: isGettingAdherents } =
    api.adherent.getAll.useQuery(undefined, {
      onError(err) {
        console.log(err);
      },
    });
  const { data: services, isLoading: isGettingServices } =
    api.service.getAll.useQuery(undefined, {
      onError(err) {
        console.log(err);
      },
    });
  const onChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  const onSearch = (value: string) => {
    console.log("search:", value);
  };
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
        title={item ? "يتغير" : "إضافة"}
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={isLoading || updateLoading}
        destroyOnClose={true}
        onCancel={handleCancel}
      >
        <Form.Item label="عضو" required labelCol={{ span: 4 }}>
          <Select
            showSearch
            optionFilterProp="children"
            value={watch("adherentId")}
            onChange={(e) => setValue("adherentId", e)}
            onSearch={onSearch}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            loading={isGettingAdherents}
            options={adherents?.map((a, i) => ({ value: a.id, label: a.name }))}
          />
        </Form.Item>
        <Form.Item label="خدمة" required labelCol={{ span: 4 }}>
          <Select
            showSearch
            optionFilterProp="children"
            value={watch("serviceId")}
            onChange={(e) => setValue("serviceId", e)}
            onSearch={onSearch}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            loading={isGettingServices}
            options={services?.map((a, i) => ({
              value: a.id,
              label: a.activite,
            }))}
          />
        </Form.Item>

        <Form.Item label="المبلغ" required labelCol={{ span: 4 }}>
          <Controller
            name="montant"
            defaultValue=""
            control={control}
            render={({ field }) => <Input type="text" {...field} />}
          />
        </Form.Item>
        <Form.Item label="تعليق" labelCol={{ span: 4 }}>
          <Controller
            name="description"
            defaultValue=""
            control={control}
            render={({ field }) => <TextArea rows={4} {...field} />}
          />
        </Form.Item>
      </Modal>
    </>
  );
};
