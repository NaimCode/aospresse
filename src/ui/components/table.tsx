/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type {Adherent, Category, Service, User} from "@prisma/client";
import { Button, Dropdown, MenuProps, Table, Tooltip } from "antd";
import { type TableRowSelection } from "antd/es/table/interface";
import { type ColumnsType } from "antd/lib/table";
import React from "react";
import { FiMoreVertical } from "react-icons/fi";
import { GrView } from "react-icons/gr";
import { DeleteOutlined,EyeOutlined,EditOutlined } from "@ant-design/icons";
import { MdMore } from "react-icons/md";

interface Props<T> {
  columns: ColumnsType<T>;
  data: T[];
  loading: boolean;
  rowSelection?: TableRowSelection<TableType>;
  // eslint-disable-next-line @typescript-eslint/ban-types
  options?: Object;
}

export type TableType = User | Category | Service |Adherent;
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

type TAction = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};
export const ActionTable = ({ onView, onEdit, onDelete }: TAction) => {
  const items: MenuProps["items"] = [
    ...(onView
        ? [
            {
              onClick: onView,

  
              icon: <EyeOutlined />,
              label: "عرض",
              key: "2",
            },
          ]
        : []),
        ...(onEdit
            ? [
                {
                  onClick: onEdit,
    
      
                  icon: <EditOutlined />,
                  label: "يحرر",
                  key: "3",
                },
              ]
            : []),
            
    {
      type: "divider",
    },

    ...(onDelete
      ? [
          {
            onClick: onDelete,
            danger: true,

            icon: <DeleteOutlined />,
            label: "يمسح",
            key: "1",
          },
        ]
      : []),
  ];
  return (
    <Dropdown menu={{ items }} placement="bottomLeft">
      <Button type="text" icon={<FiMoreVertical className="text-lg" />} />
    </Dropdown>
  );
};
