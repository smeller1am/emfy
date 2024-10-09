import {Spin, Table} from 'antd'
import {useEffect, useState} from "react";
import {PlusCircleTwoTone, MinusCircleTwoTone} from "@ant-design/icons";
import {isToday, isTomorrow, isYesterday} from 'date-fns';

const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjI2NTRjNmQ1YTA2MDBjOWYyOGE3MDZiYWZkMzE2NmEzMWI4ZjMwNWNmYjRkMjlkN2ZjMzU3MDdhYzBjOWE4NGIzNDAyM2UzMzc4YTAyY2U1In0.eyJhdWQiOiI2NmQ0N2NlOS00NzMwLTQ0MGMtODRkOC03ODk2NWQ4NDBlYjEiLCJqdGkiOiIyNjU0YzZkNWEwNjAwYzlmMjhhNzA2YmFmZDMxNjZhMzFiOGYzMDVjZmI0ZDI5ZDdmYzM1NzA3YWMwYzlhODRiMzQwMjNlMzM3OGEwMmNlNSIsImlhdCI6MTcyODMyNTk3MywibmJmIjoxNzI4MzI1OTczLCJleHAiOjE4MjM1NTg0MDAsInN1YiI6IjExNjExOTU4IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxOTkyNjYyLCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiYzllNTEyMjEtYjViMC00YTE2LTkyM2YtMjJjZjJiMmZlNzc4IiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.rRD8g43OEog0PfCP-dEJwfg0xRjgxrMwVSmvIL_BQfndqLrI93kAkPufRy-FISbRzmLBivkrczVM594uSk0MvscBrXHBffamVSqrvXiUICR4O3kzD720JsEVOn4wxKPvJjBbcPavkM_Y6hKc8TvDyLC63z-DJ2g1Z_1yVhXV0OFjtDc52wH8txb5Xz8ZuEmqxzyP6exr54fSd9XxK62t200p2sysMviGPpWKujpmE7-O271bMO1Coey1r6u201FweOlgUYdYI87uugriJqfKvGMn3TsKmNmKLYusyXqasC2MSGodrEl93P6GtIl3MzbaPusn2Vm3WnvKn0dWRVhhWg'

const columns = [
    {
        title: 'Название',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Бюджет',
        dataIndex: 'price',
        key: 'price',
    },
    {
        title: 'id',
        dataIndex: 'id',
        key: 'id',
    },

];

interface leadEntity {
    id: number;
    name: string;
    price: number;
    responsible_user_id: number;
    group_id: number;
    status_id: number;
    pipeline_id: number;
    loss_reason_id: number | null;
    created_by: number;
    updated_by: number;
    created_at: number;
    updated_at: number;
    closed_at: number | null;
    closest_task_at: number;
    is_deleted: boolean;
    custom_fields_values: null;
    score: null;
    account_id: number;
    labor_cost: null;
    key: number;
    _links: {
        self: {
            href: string;
        };
    };
    _embedded: {
        tags: [];
        companies: [];
    };
}

const requestOptions = {
    method: 'GET',
    headers: {'Authorization': `Bearer ${token}`},
};

function TableBlock() {
    const [tasks, setTasks] = useState<leadEntity[]>([])
    const [detail, setDetail] = useState<leadEntity | null>()
    const [isExpanded, setIsExpanded] = useState<number | null>()
    const fetchData = async (count: number) => {
        try {
            fetch(`https://petrovarvic.amocrm.ru/api/v4/leads?limit=${count * 3}`, requestOptions)
                .then(response => response.json())
                .then(data => setTasks((prevState) => [...data._embedded.leads].map((item, index) => {
                    return {...item, key: index};
                })))
                .catch(error => {
                    console.error('Ошибка при получении задач:', error)
                });


        } catch (error) {
            console.error('Ошибка при запросе данных:', error);
        }
    };
    const ExpandColumn = async (id: number, key: number) => {
        try {
            fetch(`https://petrovarvic.amocrm.ru/api/v4/leads/${id}`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    data.key = key
                    setIsExpanded(null)
                    setDetail(data)
                })
                .catch(error => {
                    console.error('Ошибка при получении задач:', error)
                });


        } catch (error) {
            console.error('Ошибка при запросе данных:', error);
        }
    };

    const rowDetailHandler = () => {
        if (detail) {

            const date = new Date(detail.closest_task_at * 1000).toLocaleDateString('ru-RU');
            return <>
                <p>id: {detail.id} дата: {date}</p>
                <p>статус: {checkDate(detail.closest_task_at)}</p>
                </>
        }
    }
    useEffect(() => {
        let attempts = 1;
        const maxAttempts = 6;
        const intervalId = setInterval(() => {
            if (attempts <= maxAttempts) {
                fetchData(attempts);
                attempts++;
            } else {
                clearInterval(intervalId);
            }
        }, 1000);

        return () => {
            clearInterval(intervalId)
            setTasks([])
        };
    }, []);

    function checkDate(unixTimestamp: number) {
        const date = new Date(unixTimestamp * 1000); // UNIX в миллисекунды
        console.log(date)
        if (isToday(date)) {
            return <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
                <circle cx="5" cy="5" r="5" fill="green"/>
            </svg>;
        } else if (isTomorrow(date)) {
            return <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
                <circle cx="5" cy="5" r="5" fill="yellow"/>
            </svg>;
        } else {
            return <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
                <circle cx="5" cy="5" r="5" fill="red"/>
            </svg>;
        }
    }


    return <Table dataSource={tasks} columns={columns} expandable={{
        expandedRowRender: (record) => <p style={{margin: 0}}>{rowDetailHandler()}</p>,
        onExpand: (expanded, record) => {
            setDetail(null)
            ExpandColumn(record.id, record.key)
        },
        expandIcon: ({expanded, onExpand, record}) => {
            if (isExpanded === record.key) {
                return <Spin/>
            } else if (detail?.key === record.key) {
                return <MinusCircleTwoTone onClick={e => onExpand(record, e)}/>
            } else {
                return <PlusCircleTwoTone onClick={e => onExpand(record, e)}/>
            }

        },
        expandedRowKeys: detail?.key ? [detail?.key] : [],
    }}
                  onRow={(record, rowIndex) => {
                      return {
                          onClick: event => {
                              setIsExpanded(rowIndex)
                          },

                      };
                  }}
    />;
}

export default TableBlock;
