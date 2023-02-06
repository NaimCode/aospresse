/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from "react";
import Search from "antd/lib/input/Search";
import type {Category, Service, User} from "@prisma/client";
import {useEffect} from 'react';

type TSearchItem = Category | User | Service
type TSearch = {
    data: any;
    onSearch: (list: any) => void;
    type: "member" | "category" | "service"
};

function AppSearch({data, onSearch, type}: TSearch) {
    const filter = (value: string) => {
        const filteredData = data.filter((item: any) => {
            if (!value) return true
            switch (type) {
                case "member":
                    if (item.name.includes(value) || item.email.includes(value)) {
                        return true;
                    }
                    break;
                case "category":
                    if (item.name.includes(value) || item.description.includes(value)) {
                        return true;
                    }
                    break;
                case "service":
                    if (item.activiteAdult.includes(value) || item.activiteChild.includes(value) || item.forChild.includes(value) || item.forAdult.includes(value)) {
                        return true;
                    }
                    break;
                default:
                    return false;
            }
            return false;
        });
        onSearch(filteredData);
    };
    useEffect(() => {
        onSearch(data);
    }, [data, onSearch]);
    return (
        <Search
            placeholder="اكتب بحثك"
            allowClear
            enterButton="ابحاث"
            size="large"
            className={"w-[300px]"}
            onSearch={filter}
        />
    );
}

export default AppSearch;
