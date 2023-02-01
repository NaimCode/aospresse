import type {User} from "@prisma/client";
import { Table } from "antd";
import {type TableRowSelection} from "antd/es/table/interface";
import {type ColumnsType} from "antd/lib/table";
import React from "react";

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
            size="small"

            className="w-full"
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