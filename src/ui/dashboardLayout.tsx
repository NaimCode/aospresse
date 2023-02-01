
import NavBarAdmin from "@ui/navBarAdmin";
import React, {type ReactNode} from "react";

const DashboardLayout = ({children}:{children:ReactNode}) => {
    return (
        <div className={"relative bg-[#fcfdff] w-screen h-screen"}>
            <NavBarAdmin/>
            {children}
        </div>
    )
}
export default DashboardLayout