import {type AppType} from "next/app";
import {type Session} from "next-auth";
import {SessionProvider} from "next-auth/react";

import {api} from "@utils/api";

import "../styles/globals.css";
import Head from "next/head";

import {ConfigProvider} from "antd";

const MyApp: AppType<{ session: Session | null }> = ({
                                                         Component,
                                                         pageProps: {session, ...pageProps},
                                                     }) => {
    return (
        <SessionProvider session={session}>
            <Head>
                <title>AOSPRESSE</title>
                <link
                    rel="shortcut icon"
                    href="../public/assets/favicon.ico"
                    type="image/x-icon"
                />
            </Head>
            <ConfigProvider
                direction='ltr'
            >
                <Component {...pageProps} />
            </ConfigProvider>
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
