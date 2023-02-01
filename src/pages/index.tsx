import {type GetServerSideProps, type NextPage} from "next";
import {getServerAuthSession} from "@server/auth";
import {prisma} from "@server/db";
import {ADMINS} from "@data/index";


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
    const admins = await prisma.user.count({where: {isAdmin: true}})
    if (admins === 0) {
        await prisma.user.createMany({
            data: ADMINS
        })
    }
    return {
        redirect: {
            destination: "/login",
            permanent: true,
        },
    };
};
const Home: NextPage = () => {


    return (
        <>

        </>
    );
};

export default Home;
