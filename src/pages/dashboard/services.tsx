/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, {useEffect, useState} from "react";
import DashboardLayout from "@ui/dashboardLayout";
import {api} from "@utils/api";
import type {Service, User} from "@prisma/client";
import {type ColumnsType} from "antd/lib/table";
import MyTable, {ActionTable} from "@ui/components/table";
import moment from "moment";
import {Button, Divider, Form, Input, Modal, Select, Tag} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import type {GetServerSideProps} from "next";
import {getServerAuthSession} from "@server/auth";
import Search from "antd/lib/input/Search";
import {useForm, Controller, type SubmitHandler} from "react-hook-form";

import toast from "react-hot-toast";
import ExportButton from "@ui/exportButton";


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
const Services = () => {
    const [updateMembre, setupdateMembre] = useState<Service | undefined>(undefined);
    const [dataFilter, setDataFilter] = useState<Service[]>([]);
    const {data, isLoading, refetch} = api.service.getAll.useQuery(undefined, {
        onSuccess(data) {
            setDataFilter(data)
        }
    });
    const {mutate: deleteMember} = api.service.delete.useMutation({
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
        }


    })

    const columns: ColumnsType<Service> = [
        {
            title: "بالغ",
            children: [
                {
                    title: "للصحافيين",
                    dataIndex: "forAdult",

                    key: "forAdult",
                    render: (v) => <span className={"text-md font-bold"}>{v}</span>,
                },
                {
                    title: "النشاط",
                    width: 250,
                    dataIndex: "activiteAdult",
                    key: "activiteAdult",
                },
                {
                    title: "الفئة",
                    dataIndex: "categorieAdult",
                    key: "categorieAdult",
                    render: (v) => <Tag color={v.color}>{v.name}</Tag>,

                }
            ]
        },
        {
            title: "طفل",
            children: [
                {
                    title: "للاطفال",
                    dataIndex: "forChild",
                    key: "forChild",
                    render: (v) => <span className={"text-md font-bold"}>{v}</span>,
                },
                {
                    title: "النشاط",
                    width: 250,
                    dataIndex: "activiteChild",
                    key: "activiteChild",
                },
                {
                    title: "الفئة",
                    dataIndex: "categorieChild",
                    key: "categorieChild",
                    render: (v) => <Tag color={v.color}>{v.name}</Tag>,

                }
            ]
        },
        {
            title: "تاريخ الإنشاء",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (v) => <span className={"opacity-60 text-[12px]"}>{moment(v).format("DD-MM-YYYY")}</span>,
        },
        {
            title: "",
            dataIndex: "action",
            key: "action",
            render: (_, d) => (
                <ActionTable
                    onEdit={() => {
                        setupdateMembre(d);
                    }}
                    onDelete={() => {
                        deleteMember({id: d.id})
                    }}
                />
            ),
        },
    ];

    const filter = (v: string) => {
        if (data) {
            if (!v) {
                setDataFilter(data || [])
                return
            }
            const newData = (data || []).filter((d) => {
                return d.forChild?.includes(v) || d.forAdult?.includes(v) || d.activiteAdult?.includes(v) || d.activiteChild?.includes(v);
            });
            setDataFilter(newData || [])
        }
    }
    return (
        <DashboardLayout>
            <div className="flex w-full flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-gray-700">انشطة وخدمات الجمعية</h1>
                <div className={""}>
                    <div className={"flex flex-row-reverse items-center gap-6 py-6 "}>
                        <AddMemberDialog onAdd={() => refetch()} membre={updateMembre}
                                         onClose={() => setupdateMembre(undefined)}/>
                        <Search
                            placeholder="اكتب بحثك"
                            allowClear
                            enterButton="ابحاث"
                            size="large"
                            className={"w-[300px]"}
                            onSearch={filter}
                        />
                        <div className={"flex-grow"}></div>

                        <ExportButton
                            tableName={"انشطة وخدمات الجمعية"}
                            data={dataFilter.map((d) => {
                                return {
                                    "للاطفال": d.forChild,
                                    "النشاط للاطفال": d.activiteChild,
                                    "الفئة للاطفال": (d as any).categorieChild.name,
                                    " ": "",
                                    "للبالغين": d.forAdult,
                                    "النشاط للبالغين": d.activiteAdult,
                                    "الفئة للبالغين": (d as any).categorieAdult.name,
                                    "": "",
                                    "تاريخ الإنشاء": moment(d.createdAt).format("DD-MM-YYYY"),
                                    "تاريخ التعديل": moment(d.updatedAt).format("DD-MM-YYYY"),
                                }
                            })}
                        />
                    </div>

                    <MyTable
                        loading={isLoading}
                        data={dataFilter || []}
                        // xScroll={1000}

                        columns={columns as any}
                        // columns={columns.filter((c)=>options.includes(c.key))}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Services;

type TMember = {
    forChild: string;
    forAdult: string;
    activiteChild: string;
    activiteAdult: string;
    categorieIdChild: string;
    categorieIdAdult: string;

};
const AddMemberDialog = ({
                             onAdd,
                             membre,
                             onClose
                         }: { onAdd: () => void, onClose: () => void, membre: Service | undefined }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const {handleSubmit, control, formState: {errors}, setValue, reset} = useForm<TMember>();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (membre) {
            setIsModalOpen(true)
            setValue("forChild", membre.forChild || "")
            setValue("forAdult", membre.forAdult || "")
            setValue("activiteChild", membre.activiteChild || "")
            setValue("activiteAdult", membre.activiteAdult || "")
            setValue("categorieIdChild", membre.categorieIdChild)
            setValue("categorieIdAdult", membre.categorieIdAdult)


        }
    }, [membre, setValue])

    const showModal = () => {
        setIsModalOpen(true);
        reset()

    };


    const handleCancel = () => {
        setIsModalOpen(false);
        onClose()
    };

    const handleOk = () => handleSubmit(onSubmit)()
    const {mutate: add, isLoading} = api.service.add.useMutation({
        onSuccess: () => {
            toast.success("تمت الإضافة بنجاح")
            setIsModalOpen(false)
            onAdd()
        },
        onError: (e) => {
            console.log(e)
            toast.error("حدث خطأ")
        }
    })

    const {mutate: update, isLoading: updateLoading} = api.service.update.useMutation({
        onSuccess: () => {
            toast.success("تم التحديث بنجاح")
            setIsModalOpen(false)
            onAdd()
        },
        onError: (e) => {
            console.log(e)
            toast.error("حدث خطأ")
        }
    })

    const onSubmit: SubmitHandler<TMember> = (data: TMember) => {

        if (!data.forChild || !data.forAdult || !data.activiteChild || !data.activiteAdult || !data.categorieIdChild || !data.categorieIdAdult) {
            toast.error("يجب ملئ جميع الحقول")
            return
        }

        if (membre) update({
            id: membre.id,
            forChild: data.forChild,
            forAdult: data.forAdult,
            activiteChild: data.activiteChild,
            activiteAdult: data.activiteAdult,
            categorieIdChild: data.categorieIdChild,
            categorieIdAdult: data.categorieIdAdult
        })
        else add({
            forChild: data.forChild,
            forAdult: data.forAdult,
            activiteChild: data.activiteChild,
            activiteAdult: data.activiteAdult,
            categorieIdChild: data.categorieIdChild,
            categorieIdAdult: data.categorieIdAdult
        })

    }

    const {data: categories, isLoading: gettingCat} = api.category.getAll.useQuery()
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
                title={membre ? "تعديل الخدمة" : "أضف الخدمة"}
                open={isModalOpen}
                onOk={handleOk}
                confirmLoading={isLoading || updateLoading}
                destroyOnClose={true}
                onCancel={handleCancel}
            >

                <div className="space-y-3 py-6">
                    <Form.Item label="للاطفال" required labelCol={{span: 5}}>
                        <Controller
                            name="forChild"
                            defaultValue=""
                            control={control}
                            render={({field}) => <Input {...field} />}
                        />
                    </Form.Item>
                    <Form.Item label="النشاط" required labelCol={{span: 5}}>
                        <Controller
                            name="activiteChild"
                            defaultValue=""
                            control={control}
                            render={({field}) => <Input {...field} />}
                        />
                    </Form.Item>
                    <Form.Item label="نوع النشاط" required labelCol={{span: 5}}>
                        <Select
                            // showSearch
                            // style={{ width: 200 }}
                            optionFilterProp="children"
                            onChange={(value) => setValue("categorieIdChild", value)}

                            loading={gettingCat}
                            options={categories?.map((c) => ({label: c.name, value: c.id}))}
                        />
                    </Form.Item>
                    <Divider/>
                    <Form.Item label="للصحافيين" required labelCol={{span: 5}}>
                        <Controller
                            name="forAdult"
                            defaultValue=""
                            control={control}
                            render={({field}) => <Input  {...field} />}
                        />
                    </Form.Item>
                    <Form.Item label="النشاط" required labelCol={{span: 5}}>
                        <Controller
                            name="activiteAdult"
                            defaultValue=""
                            control={control}
                            render={({field}) => <Input {...field} />}
                        />
                    </Form.Item>
                    <Form.Item label="نوع النشاط" required labelCol={{span: 5}}>
                        <Select

                            optionFilterProp="children"
                            onChange={(value) => setValue("categorieIdAdult", value)}
                            tagRender={(props) => <Tag color="blue" {...props} />}
                            loading={gettingCat}
                            options={categories?.map((c) => ({label: c.name, value: c.id}))}
                        />
                    </Form.Item>
                </div>
            </Modal>
        </>
    );
};
