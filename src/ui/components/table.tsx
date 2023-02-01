import type {User} from "@prisma/client";
import {Button, Table, Tooltip} from "antd";
import {type TableRowSelection} from "antd/es/table/interface";
import {type ColumnsType} from "antd/lib/table";
import React from "react";
import {AiFillEdit, GrView} from "react-icons/all";
import {DeleteOutlined} from "@ant-design/icons";

interface Props<T> {
    columns: ColumnsType<T>;
    data: T[];
    loading: boolean;
    rowSelection?: TableRowSelection<TableType>;
    // eslint-disable-next-line @typescript-eslint/ban-types
    options?: Object;
}

export type TableType = User;
const MyTable: React.FC<Props<TableType>> = ({
                                                 columns,
                                                 data,
                                                 loading,
                                                 options,
                                                 rowSelection,
                                             }) => {

    return (
        <Table
           // size="small"

            //className="w-full"
            rowSelection={rowSelection}
            rowKey={(record) => record.id}
            {...options}
            loading={loading}
            columns={columns}
            dataSource={data}
        />
    );
};

export default MyTable;


type TAction={

    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}
export const ActionTable = ({onView,onEdit,onDelete}:TAction) => {
    return <div className={"flex flex-row gap-2 items-center"}>
        {onView && <Tooltip title="لترى">
            <Button  shape="circle" icon={<GrView />} />
        </Tooltip>}

        {onEdit &&<Tooltip title="للتعديل">
            <Button  shape="circle" icon={<AiFillEdit className={"text-blue-800"}/>} />
        </Tooltip>}
        {onDelete && <Tooltip title="إزالة">
            <Button  shape="circle" icon={<DeleteOutlined className={"text-red-500"}/>} />
        </Tooltip>}
    </div>
}