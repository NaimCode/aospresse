import React from "react";
import {
  LogoutOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, type MenuProps } from "antd";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { BiCategoryAlt } from "react-icons/bi";
import { MdWorkOutline } from "react-icons/md";
import { TbRelationOneToOne } from "react-icons/tb";
import cx from "classnames";
type TMenu = {
  title: string;
  icon: React.ReactNode;
  route: string;
};
const menuItems: TMenu[] = [
  {
    title: "أعضاء",
    icon: <TeamOutlined />,
    route: "/dashboard/members",
  },
  {
    title: "خدمات المنخرطين",
    icon: <TbRelationOneToOne />,
    route: "/dashboard/relation",
  },
  {
    title: "المنخرطين",
    icon: <TeamOutlined />,
    route: "/dashboard/adherents",
  },

  {
    title: "خدمات",
    icon: <MdWorkOutline />,
    route: "/dashboard/services",
  },
  {
    title: "أنواع الخدمات",
    icon: <BiCategoryAlt />,
    route: "/dashboard/categories",
  },
];

function NavBarAdmin() {
  const { data: session } = useSession();

  const router = useRouter();
  const items: MenuProps["items"] = [
    {
      onClick: () => {
        void signOut()
          .then(() => {
            toast.success("تم تسجيل الخروج بنجاح");
            void router.push("/login");
          })
          .catch((e) => {
            console.log(e);
            toast.error("حدث خطأ ما");
          });
      },
      label: (
        <div className={"flex flex-row gap-2 text-red-500"}>
          <LogoutOutlined />
          تسجيل الخروج
        </div>
      ),
      key: "1",
    },
  ];

  return (
    <div
      className={
        "sticky flex h-[63px] flex-row items-center justify-between bg-white py-3 px-6 shadow-sm"
      }
    >
      <img src={"/logo_small.png"} alt={"logo"} className={"w-[70px]"} />

      <div className={"flex flex-row items-center justify-center gap-10 "}>
        {menuItems.map((item, index) => {
          const isCurr = router.pathname === item.route;
          return (
            <>
              <div
                key={index}
                onClick={() => {
                  void router.push(item.route);
                }}
                className={cx(
                  "flex transform cursor-pointer flex-row items-center gap-2 transition-all duration-500",
                  isCurr && "scale-110 text-blue-900"
                )}
              >
                {item.icon}
                <p className={cx(isCurr ? "text-blue-800" : "text-gray-500 ")}>
                  {item.title}
                </p>
              </div>
              {index == 0 && <div className={"h-[30px] w-[1px] bg-gray-300"} />}
            </>
          );
        })}
      </div>
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <Dropdown menu={{ items }}>
        <Button size={"large"} loading={!session} icon={<UserOutlined />}>
          {session ? session.user.name : ""}
        </Button>
      </Dropdown>
    </div>
  );
}

export default NavBarAdmin;
