//nextjs page for dashboard
import { getServerAuthSession } from '@server/auth';
import { type GetServerSideProps, type NextPage } from 'next';
import React from 'react';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const session = await getServerAuthSession(ctx);
   
    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: true,
        },
      };
    }

    return {
        redirect: {
            destination: "/dashboard/adherents",
            permanent: true,
        },
    };
  };
const Dashboard:NextPage = () => {
    return (
       <div>
       </div>
    )
}
export default Dashboard