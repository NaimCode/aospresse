/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState } from "react";
import DashboardLayout from "@ui/dashboardLayout";
import { api } from "@utils/api";
import type { User } from "@prisma/client";
import { type ColumnsType } from "antd/lib/table";
import MyTable, { ActionTable } from "@ui/components/table";
import moment from "moment";
import { Button, Form, Input, Modal, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { GetServerSideProps } from "next";
import { getServerAuthSession } from "@server/auth";
import Search from "antd/lib/input/Search";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";

import toast from "react-hot-toast";
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
const Members = () => {
  const { data, isLoading,refetch } = api.member.getAll.useQuery();
  const columns: ColumnsType<User> = [
    {
      title: "الاسم و النسب",
      dataIndex: "name",
      key: "name",
      render: (v) => <span className={"text-md font-bold"}>{v}</span>,
    },
    {
      title: "كلمه السر",
      dataIndex: "password",
      key: "password",
      render: (v) => <Tag color="magenta">{v}</Tag>,
    },
    {
      title: "بريد إلكتروني",
      dataIndex: "email",
      key: "email",
    },

    {
      title: "تاريخ الإنشاء",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => moment(v).format("L"),
    },

    {
      title: "",
      dataIndex: "action",
      key: "action",
      render: (_, d) => (
        <ActionTable
          onEdit={() => {
            console.log(d);
          }}
          onDelete={() => {
            console.log(d);
          }}
          onView={() => {
            console.log(d);
          }}
        />
      ),
    },
  ];
  return (
    <DashboardLayout>
      <div className="flex w-full flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-700">أعضاء الإدارة</h1>
        <div className={""}>
          <div className={"flex flex-row-reverse items-center gap-6 py-6 "}>
            <AddMemberDialog onAdd={()=>refetch()}/>
            <Search
              placeholder="اكتب بحثك"
              allowClear
              enterButton="ابحاث"
              size="large"
              className={"w-[300px]"}
              // onSearch={onSearch}
            />
          </div>

          <MyTable
            loading={isLoading}
            data={data || []}
            // xScroll={1000}

            columns={columns}
            // columns={columns.filter((c)=>options.includes(c.key))}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Members;

type TMember = {
  name: string;
  password: string;
  confirmationPassword: string;
    email: string;
};
const AddMemberDialog = ({onAdd}:{onAdd:()=>void}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const { handleSubmit, control, formState:{errors} } = useForm<TMember>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };


  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOk = () => handleSubmit(onSubmit)()
const {mutate:add,isLoading}=api.member.add.useMutation({
    onSuccess:()=>{
        toast.success("تمت الإضافة بنجاح")
        setIsModalOpen(false)
        onAdd()
    },
    onError:(e)=>{
        console.log(e)
        toast.error("حدث خطأ")
    }
})

const onSubmit:SubmitHandler<TMember>=(data: TMember)=>{

    if(errors.confirmationPassword || errors.password || errors.name||errors.email){
        toast.error("يجب ملئ جميع الحقول")
        return
    }
    if(data.password !== data.confirmationPassword){
        toast.error("كلمة السر غير متطابقة")
        return
    }
    add({name:data.name,password:data.password,email:data.email})
     
  }
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
        title="اضافة عضو جديد"
        open={isModalOpen}
        onOk={handleOk}
        confirmLoading={isLoading}
        destroyOnClose={true}
        onCancel={handleCancel}
      >

        <div className="space-y-3 py-6">
          <Form.Item label="اسم" required labelCol={{ span: 5 }}>
            <Controller
              name="name"
              defaultValue=""
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>
          <Form.Item label="بريد إلكتروني" required labelCol={{ span: 5 }}>
            <Controller
              name="email"
              defaultValue=""
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>
          <Form.Item label="كلمة السر" required labelCol={{ span: 5 }}>
            <Controller
              name="password"
              defaultValue=""
              control={control}
              render={({ field }) => <Input type="password" {...field} />}
            />
          </Form.Item>
          <Form.Item label="تأكيد" required labelCol={{ span: 5 }}>
            <Controller
              name="confirmationPassword"
              defaultValue=""
              control={control}
              render={({ field }) => <Input type="password"  {...field} />}
            />
          </Form.Item>
        </div>
      </Modal>
    </>
  );
};
