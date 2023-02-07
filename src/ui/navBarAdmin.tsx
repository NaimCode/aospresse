import React from 'react';
import {LogoutOutlined, SettingOutlined, TeamOutlined, UserOutlined} from "@ant-design/icons";
import {Button, Dropdown, type MenuProps,} from "antd";
import {signOut, useSession} from "next-auth/react";
import toast from "react-hot-toast";
import {useRouter} from "next/router";
import {BiCategoryAlt} from "react-icons/bi";
import { MdWorkOutline} from "react-icons/md";

import cx from "classnames";
type TMenu = {
    title: string,
    icon: React.ReactNode,
    route: string

}
const menuItems: TMenu[] = [
    {
        title: "المنخرطين",
        icon: <TeamOutlined />,
        route: "/dashboard/members"
    },
    {
        title: "أعضاء",
        icon: <TeamOutlined />,
        route: "/dashboard/adherents"
    },
    {
        title: "خدمات",
        icon: <MdWorkOutline />,
        route: "/dashboard/services"
    },
    {
        title: "أنواع الخدمات",
        icon: <BiCategoryAlt />,
        route: "/dashboard/categories"
    },
]

function NavBarAdmin() {
    const {data: session} = useSession()
    console.log(session)
    const router = useRouter()
    const items: MenuProps['items'] = [
        {
            onClick: () => {
          console.log('Click settings')
            },
            label: (
                <div className={"flex flex-row gap-2"}>
                    <SettingOutlined />
                    الخدمات
                </div>
            ),
            key: '0',
        },
        {
            onClick: () => {
                void signOut().then(() => {
                    toast.success("تم تسجيل الخروج بنجاح")
                    void router.push("/login")
                }).catch((e) => {
                    console.log(e)
                    toast.error("حدث خطأ ما")

                })
            },
            label: (
                <div className={"flex flex-row gap-2 text-red-500"}>
                    <LogoutOutlined/>
                    تسجيل الخروج
                </div>
            ),
            key: '1',
        },

    ];


    return (
        <div className={"h-[63px] sticky flex flex-row items-center py-3 px-6 bg-white shadow-sm justify-between"}>
            <img src={"/logo_small.png"} alt={"logo"} className={"w-[70px]"}/>

            <div className={"flex flex-row gap-10 items-center justify-center "}>
                {menuItems.map((item, index) => {
                    const isCurr=router.pathname===item.route;
                    return (
                        <>

                            <div key={index} onClick={() => {
                                void router.push(item.route)
                            }} className={cx("flex flex-row gap-2 transform transition-all duration-500 items-center cursor-pointer",isCurr&&"text-blue-900 scale-110")}>
                                {item.icon}
                                <p className={cx(isCurr?"text-blue-800":"text-gray-500 ")}>{item.title}</p>
                            </div>
                            {index ==0 && <div className={"w-[1px] h-[30px] bg-gray-300"}/>}
                        </>
                    )
                })
                }
            </div>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
            <Dropdown menu={{items}}>
                <Button size={"large"} loading={!session}
                        icon={<UserOutlined/>}>{session ? session.user.name : ""}</Button>

            </Dropdown>
        </div>
    );
}

export default NavBarAdmin;