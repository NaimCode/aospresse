import React from 'react';
import {Button} from "antd";
import {FileExcelOutlined} from "@ant-design/icons";
import tableExport from "antd-table-export";
import * as XLSX from 'xlsx';

const exportExcel= (data: any,columns:any,tableName:string) => {
    const exportInstance = new tableExport(data, columns);
    exportInstance.download(tableName, "xlsx");
}
function ExportButton({data,tableName}:{data:any,tableName:string}) {
    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "1");
        XLSX.writeFile(workbook, tableName+".xlsx");
    };
    return (
        <Button
            className={"flex flex-row items-center gap-2"}
            type={"dashed"}
            size={"large"}
            onClick={downloadExcel}
        >
            <FileExcelOutlined/> ملف اكسل
        </Button>
    );
}

export default ExportButton;