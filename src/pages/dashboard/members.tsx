import React from 'react';
import DashboardLayout from "@ui/dashboardLayout";
import {api} from "@utils/api";
import type {User} from "@prisma/client";
import {type ColumnsType} from "antd/lib/table";
import MyTable, {ActionTable, TableType} from "@ui/components/table";
import moment from "moment";
import {Button, Switch, Tag} from "antd";
import Search from "antd/es/input/Search";
import {AddOutline} from "@rsuite/icons";
import {PlusOutlined} from "@ant-design/icons";

function Members() {
    const {data, isLoading} = api.member.getAll.useQuery()
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
            render: (v)=>moment().format('L'),
        },

        {
            title: "",
            dataIndex: "action",
            key: "action",
            render: (_,d)=><ActionTable onEdit={()=>{
                console.log(d)
            }} onDelete={()=>{
                console.log(d)
            }} onView={()=>{
                console.log(d)
            }} />,
        },
    ]
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center w-full">
                <h1 className="text-3xl font-bold text-gray-700">أعضاء الإدارة</h1>
                <div className={""}>
                   <div className={"flex flex-row-reverse gap-6 py-6 items-center "}>
                       <Button icon={<PlusOutlined />} type={"primary"} size={"large"}>
                           يضيف
                       </Button>
                     
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
}

export default Members;