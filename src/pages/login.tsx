import {getServerAuthSession} from '@server/auth';

import {type GetServerSideProps, type NextPage} from 'next';
import React, {useState} from 'react'
import Lottie from "@ui/components/lottie";

import animation from '../../public/lotties/login.json'
import {EyeInvisibleOutlined, EyeTwoTone, LockOutlined, UserOutlined} from "@ant-design/icons";
import {Button, Divider, Input} from "antd";
import {signIn} from "next-auth/react";
import toast from "react-hot-toast";
import {useRouter} from "next/router";
export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const session = await getServerAuthSession(ctx);

    if (session) {
        return {
            redirect: {
                destination: "/dashboard",
                permanent: true,
            },
        };
    }

    return {
        props: {}
    };
};
const Login: NextPage = () => {

    return (
        <div className="flex flex-row w-screen h-screen bg-primary items-stretch">
            <div className="w-1/2 rounded-l-3xl bg-white flex flex-col justify-center items-center gap-16">

            <img src={"/logo_large.png"} alt={"logo"} className={"w-[70%]"}/>

                   <Auth/>


            </div>
            <div className="w-1/2 flex flex-col items-center justify-center">

                <h1 className="text-blue-900">
                    مرحبًا بك في حسابك الخاص !
                </h1>
                <p>
                    منظومة معلوماتية متكاملة تمكن من تسجيل منخرطين جدد .
                </p>
                <div>
                    <Lottie animationData={animation}/>
                </div>
            </div>

        </div>
    )
}



export default Login



function Auth() {
    const [name, setName] = useState("");
    const [pwd, setPwd] = useState("");
    const [isLoading, setisLoading] = useState(false);
    const router=useRouter()
    const onSubmit=()=> {
        setisLoading(true);
        signIn("credentials", {
            name,
            password:pwd,
            redirect: false,
        })
            .then((data) => {
                if (data?.ok) {
                    toast.success("تم المصادقة عليك بنجاح");
                    void router.replace("/dashboard");
                } else {
                    switch (data?.error) {
                        case "Password invalid":
                            toast.error("كلمة المرور غير صحيحة");
                            break;
                        case "User not exist":
                            toast.error("المستخدم غير موجود");
                            break;
                        default:
                            toast.error("يوجد خطأ");
                            break;
                    }
                }
            })
            .finally(() => {
                setisLoading(false);
            });
    };
    return <div className={"flex flex-col items-start w-[400px] gap-5"}>
        <Input value={name} onChange={(e)=>setName(e.target.value)} size="large" placeholder="إسم المستخدم" prefix={<UserOutlined />}/>
        <Input.Password  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} type={"password"} value={pwd} onChange={(e)=>setPwd(e.target.value)} size="large" placeholder="كلمة المرور" prefix={<LockOutlined />}/>

        <Divider />
        <Button onClick={onSubmit} loading={isLoading}  type="primary" block>
            تسجيل الدخول
        </Button>
    </div>;
}
