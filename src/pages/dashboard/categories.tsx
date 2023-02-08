/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, {useEffect, useRef, useState} from "react";
import DashboardLayout from "@ui/dashboardLayout";
import {api} from "@utils/api";
import  {type Category} from "@prisma/client";
import {type ColumnsType} from "antd/lib/table";
import MyTable, {ActionTable} from "@ui/components/table";
import moment from "moment";
import {Button, Form, Input, Modal, Switch} from "antd";
import {PlusOutlined, CheckOutlined} from "@ant-design/icons";
import type {GetServerSideProps} from "next";
import {getServerAuthSession} from "@server/auth";

import {useForm, Controller, type SubmitHandler} from "react-hook-form";

import toast from "react-hot-toast";
import TextArea from "antd/lib/input/TextArea";
import {COLORS} from "@data/index";
import cx from "classnames";
import Search from "antd/lib/input/Search";

import ExportButton from "@ui/exportButton";
import { DATE_FORMAT } from "@config/index";

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
        props: {},
    };
};


const Category = () => {
    const [updateitem, setupdateitem] = useState<Category | undefined>(undefined);
    const {data, isLoading, refetch} = api.category.getAll.useQuery(undefined, {
        onSuccess(data) {
            setDataFilter(data)
        },
    });
    const {mutate: deleteIt} = api.category.delete.useMutation({
        onSuccess: () => {
            toast.dismiss();
            toast.success("تم حذف العضو بنجاح");
            void refetch();
        },
        onError: () => {
            toast.dismiss();
            toast.error("حدث خطأ ما");
        },
        onMutate: () => {
            toast.loading("جاري حذف العضو");
        },
    });

    const columns: ColumnsType<Category> = [
        {
            title: "لون",
            dataIndex: "color",
            key: "color",
            render: (v) => <div
                style={{backgroundColor: v}}
                className={"h-6 w-6 rounded-md "}
            />,
        },
        {
            title: "عنوان",
            dataIndex: "name",
            key: "name",
            render: (v) => <span className={"text-md font-bold"}>{v}</span>,
        },
        {
            title: "الوصف",
            dataIndex: "description",
            width: 400,
            key: "description",
            render: (v) => <p className={"opacity-70"}>{v}</p>,
        },

        {
            title: "تاريخ الإنشاء",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (v) => <span className={"opacity-60 text-[12px]"}>{moment(v).format(DATE_FORMAT)}</span>,
        },
        {
            title: "تاريخ التعديل",
            dataIndex: "updatedAt",
            key: "updatedAt",
            render: (v) => <span className={"opacity-60 text-[12px]"}>{moment(v).format(DATE_FORMAT)}</span>,
        },
        {
            title: "",
            dataIndex: "action",
            key: "action",
            render: (_, d) => (
                <ActionTable
                    onEdit={() => {
                        setupdateitem(d);
                    }}
                    onDelete={() => {
                        deleteIt({id: d.id});
                    }}
                />
            ),
        },
    ];
    const [dataFilter, setDataFilter] = useState<Category[]>([])

    const filter = (v: string) => {
        if (data) {
            if (!v) {
                setDataFilter(data || [])
                return
            }
            const newData = data?.filter((d) => d.name.includes(v) || d.description?.includes(v))
            setDataFilter(newData || [])
        }
    }
    const componentRef = useRef<HTMLDivElement>(null);



    return (
        <DashboardLayout>
            <div className="flex w-full flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-gray-700">إدارة الفئة</h1>
                <div className={""}>
                    <div className={"flex flex-row-reverse items-center gap-6 py-6 "}>


                        <MyDialog
                            onAdd={() => refetch()}
                            item={updateitem}
                            onClose={() => setupdateitem(undefined)}
                        />


                        <Search
                            placeholder="اكتب بحثك"
                            allowClear
                            enterButton="ابحاث"
                            size="large"
                            className={"w-[300px]"}
                            onSearch={filter}
                        />
                        <div className={"flex-grow"}></div>

                        <ExportButton data={dataFilter.map(d=>{
                            return {
                                "العنوان":d.name,
                                "الوصف":d.description,
                                "تاريخ الإنشاء":moment(d.createdAt).format(DATE_FORMAT),
                                "تاريخ التعديل":moment(d.updatedAt).format(DATE_FORMAT),
                            }
                        })} tableName={"إدارة الفئة"}/>

                    </div>

                    <div ref={componentRef}>
                        <MyTable
                            loading={isLoading}
                            data={dataFilter || []}
                            // xScroll={1000}

                            columns={columns as any}
                            // columns={columns.filter((c)=>options.includes(c.key))}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Category;

type TCategory = {
    name: string;
    description?: string;
    color?: string;
};
const MyDialog = ({
                      onAdd,
                      item,
                      onClose,
                  }: {
    onAdd: () => void;
    onClose: () => void;
    item: Category | undefined;
}) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const {
        handleSubmit,
        control,
        formState: {errors},
        setValue,
        reset,
        watch,
    } = useForm<TCategory>({
        defaultValues: {color: COLORS[0]}
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasColor, setHasColor] = useState(true)
    useEffect(() => {
        if (item) {
            setIsModalOpen(true);
            setValue("name", item.name);
            setValue("description", item.description || undefined);
            setValue("color", item.color || undefined);
            setHasColor(!!item.color)
        }
    }, [item, setValue]);

    const showModal = () => {
        setIsModalOpen(true);
        reset();
        onClose()

    };

    const handleCancel = () => {
        setIsModalOpen(false);
        onClose();
    };

    const handleOk = () => handleSubmit(onSubmit)();
    const {mutate: add, isLoading} = api.category.add.useMutation({
        onSuccess: () => {
            toast.success("تمت الإضافة بنجاح");
            setIsModalOpen(false);
            onAdd();
        },
        onError: (e) => {
            console.log(e);
            toast.error("حدث خطأ");
        },
    });

    const {mutate: update, isLoading: updateLoading} =
        api.category.update.useMutation({
            onSuccess: () => {
                toast.success("تم التحديث بنجاح");
                setIsModalOpen(false);
                onAdd();
            },
            onError: (e) => {
                console.log(e);
                toast.error("حدث خطأ");
            },
        });

    const onSubmit: SubmitHandler<TCategory> = (data: TCategory) => {
        if (errors.name) {
            toast.error("يجب ملئ جميع الحقول");
            return;
        }

        if (item)
            update({
                id: item.id,
                name: data.name,
                description: data.description,
                color: hasColor ? data.color : undefined,
            });

        else
            add({
                name: data.name,
                description: data.description,
                color: hasColor ? data.color : undefined,
            });
    };

    return (
        <>
            <Button
                onClick={showModal}
                icon={<PlusOutlined/>}
                type={"primary"}
                size={"large"}
            >
                يضيف
            </Button>
            <Modal
                title={item ? "تغيير الفئة" : "أضف فئة"}
                open={isModalOpen}
                onOk={handleOk}
                confirmLoading={isLoading || updateLoading}
                destroyOnClose={true}
                onCancel={handleCancel}
            >
                <div className="space-y-3 py-6">
                    <Form.Item label="اسم" required labelCol={{span: 5}}>
                        <Controller
                            name="name"
                            defaultValue=""
                            control={control}
                            render={({field}) => <Input {...field} />}
                        />
                    </Form.Item>
                    <Form.Item label="وصف" required labelCol={{span: 5}}>
                        <Controller
                            name="description"
                            defaultValue=""
                            control={control}
                            render={({field}) => <TextArea rows={4} {...field} />}
                        />
                    </Form.Item>

                    <Switch className="mr-[100px] mt-1" checkedChildren="لون" unCheckedChildren="لون" checked={hasColor}
                            onChange={(e) => setHasColor(e)}/>
                    <div className={cx("flex flex-row justify-end gap-2 pt-1", hasColor || "hidden")}>

                        {COLORS.map((c) => {
                            const selected = watch("color") === c;

                            return (
                                <div
                                    onClick={() => setValue("color", c)}
                                    key={c}
                                    className="flex flex-col items-center gap-2 cursor-pointer"
                                >
                                    <div
                                        style={{backgroundColor: c}}
                                        className={"h-10 w-10 rounded-xl "}
                                    />
                                    <CheckOutlined
                                        className={cx(
                                            "transition-all ",
                                            selected ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        </>
    );
};
