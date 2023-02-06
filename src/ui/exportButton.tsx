import React from 'react';
import {Button} from "antd";
import {FileExcelOutlined} from "@ant-design/icons";
import tableExport from "antd-table-export";


const exportExcel= (data: any,columns:any,tableName:string) => {
    const exportInstance = new tableExport(data, columns);
    exportInstance.download(tableName, "xlsx");
}
function ExportButton({dataFilter,columns,tableName}:{dataFilter:any,columns:any,tableName:string}) {
    return (
        <Button
            className={"flex flex-row items-center gap-2"}
            type={"dashed"}
            size={"large"}
            onClick={() => exportExcel(dataFilter,columns,tableName)}
        >
            <FileExcelOutlined/> ملف اكسل
        </Button>
    );
}

export default ExportButton;