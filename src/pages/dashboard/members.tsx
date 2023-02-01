import React from 'react';
import DashboardLayout from "@ui/dashboardLayout";
import {api} from "@utils/api";
import type {User} from "@prisma/client";
import {type ColumnsType} from "antd/lib/table";
import MyTable, {TableType} from "@ui/components/table";

function Members() {
    const {data, isLoading} = api.member.getAll.useQuery()
    const columns: ColumnsType<User> = [
        {
            title: "",
            dataIndex: "name",
            key: "name",
            render: (v) => <span className="italic text-primary text-[12px]">{v}</span>,
        },

    ]
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center w-full">
                <h1 className="text-3xl font-bold text-gray-700">Members</h1>
                <MyTable
                    loading={isLoading}
                    data={data || []}
                    // xScroll={1000}

                    columns={columns}
                    // columns={columns.filter((c)=>options.includes(c.key))}
                />
            </div>

        </DashboardLayout>
    );
}

export default Members;