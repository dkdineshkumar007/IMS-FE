import React, { useState, useEffect, useMemo } from "react";
import { Card } from "antd";
import "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import MenuItem from "@mui/material/MenuItem";
import axios from "axios";
import { debounce } from "lodash";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";
import moment from "moment";
import { Badge, Descriptions } from "antd";

const nodeAPIUrl = `http://localhost:5000/api/v1`;

const Orders = () => {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchValue, setSearchVal] = useState("");

  const colDefs = [
    {
      field: "orderNumber",
      width: 200,
      cellRenderer: "agGroupCellRenderer",
    },
    {
      field: "paymentStatus",
      width: 200,
    },
    {
      field: "localStatus",
      width: 200,
    },
    { field: "onlineStatus", width: 200 },
    {
      field: "orderedOn",
      width: 200,
      cellRenderer: ({ value }) => {
        const date2 = moment(value).format("MM/DD/YYYY");
        return date2 ? date2 : value ? value : "";
      },
    },
    {
      field: "shipByDate",
      width: 200,
      cellRenderer: ({ value }) => {
        const date2 = moment(value).format("MM/DD/YYYY");
        return date2 ? date2 : value ? value : "";
      },
    },
    {
      field: "orderTotal",
      //   headerName: "Action",
      width: 200,
    },
    {
      field: "Notes",
      //   headerName: "Action",
      width: 200,
    },
  ];
  const [defaultColDef] = useState({
    editable: false,
    sortable: true,
    filter: false,
    selectable: false,
    flex: 1,
  });

  //   {
  //     "_id": "65f481dec75333b0a0367b46",
  //     "orderNumber": "ORD377476",
  //     "shipByDate": "2024-03-15 11:30:00+00:00",
  //     "paymentStatus": "Paid",
  //     "orderedOn": "2024-03-15 11:30:00+00:00",
  //     "cancelledOn": null,
  //     "isCancelled": false,
  //     "localStatus": "Pending",
  //     "onlineStatus": "Pending",
  //     "customerName": "Jane Smith",
  //     "shippingAddress": "654 Cedar St, Riverside, USA",
  //     "products": [
  //         {
  //             "sku": "VKC-5897R",
  //             "qty": 3
  //         },
  //         {
  //             "sku": "PRG-9745B",
  //             "qty": 1
  //         },
  //         {
  //             "sku": "LNR-6550A",
  //             "qty": 4
  //         },
  //         {
  //             "sku": "BT-5989A",
  //             "qty": 4
  //         }
  //     ],
  //     "paymentType": "Cash on Delivery",
  //     "orderTotal": "4.67"
  // },

  const items = [
    {
      key: "1",
      label: "Order Number",
      children: `${selectedOrder?.orderNumber}`,
    },
    {
      key: "2",
      label: "Customer Name",
      children: `${selectedOrder?.customerName}`,
    },
    {
      key: "3",
      label: "Order Status",
      children: `${selectedOrder?.localStatus}`,
    },
    {
      key: "4",
      label: "Ordered On",
      children: `${moment(selectedOrder?.orderedOn).format("MM/DD/YYYY")}`,
    },
    {
      key: "5",
      label: "Ship Before",
      span: 2,
      children: `${moment(selectedOrder?.shipByDate).format("MM/DD/YYYY")}`,
    },
    {
      key: "6",
      label: "Online Status",
      span: 3,
      children: (
        <Badge status="processing" text={`${selectedOrder?.onlineStatus}`} />
      ),
    },
    {
      key: "7",
      label: "Order Amount",
      children: isNaN(parseFloat(selectedOrder?.orderTotal))
        ? "Invalid order total"
        : parseFloat(selectedOrder.orderTotal).toFixed(2),
    },
    {
      key: "8",
      label: "Discount",
      children: "5%",
    },
    {
      key: "9",
      label: "Total Amount",
      children: isNaN(parseFloat(selectedOrder?.orderTotal))
        ? "Invalid order total"
        : (parseFloat(selectedOrder.orderTotal) * 0.95).toFixed(2),
    },
    {
      key: "10",
      label: "Customer Info",
      children: (
        <>
          Customer Name: {`${selectedOrder?.customerName}`}
          <br />
          Phone Number: {`${selectedOrder?.phoneNumber}`}
          <br />
          Email: {`${selectedOrder?.email}`}
          <br />
          Ship To Address: {`${selectedOrder?.shippingAddress}`}
          <br />
          {/* Replication factor: 3
          <br />
          Region: East China 1
          <br /> */}
        </>
      ),
    },
  ];

  const detailCellRendererParams = () => {
    return {
      detailGridOptions: {
        columnDefs: [
          { field: "sku", flex: 1 },
          { field: "qty", flex: 1 },
        ],
      },
      getDetailRowData: (params) => {
        params.successCallback(params?.data?.products);
      },
    };
  };

  const getContextMenuItems = (params) => {
    console.log({ params });
    const { orderNumber = "", _id = "" } = params?.node?.data || {};
    const result = [
      "cut",
      "copy",
      "paste",
      "copyWithHeaders",
      "export",
      // "separator",
    ];
    const localStatus = {
      name: "Local Status",
      subMenu: [
        {
          name: "PENDING",
          action: () => {
            updateStatus(_id, orderNumber, "PENDING");
          },
        },
        {
          name: "READY TO PICK",
          action: () => {
            updateStatus(_id, orderNumber, "READY TO PICK");
          },
        },
        {
          name: "READY TO PACK",
          action: () => {
            updateStatus(_id, orderNumber, "READY TO PACK");
          },
        },
        {
          name: "READY TO SHIP",
          action: () => {
            updateStatus(_id, orderNumber, "READY TO SHIP");
          },
        },
        {
          name: "SHIPPED",
          action: () => {
            updateStatus(_id, orderNumber, "SHIPPED");
          },
        },
      ],
    };
    result.unshift(localStatus, "separator");
    return result;
  };

  const getRowId = useMemo(() => {
    return (params) => {
      return params?.data?._id;
    };
  }, []);

  const getOrders = async () => {
    await axios
      .get(`${nodeAPIUrl}/orders/get-all`)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data && result?.data?.length) {
          setRowData(result?.data);
        } else {
          setRowData([]);
        }
      })
      .catch((error) => {
        setRowData([]);
        console.error("Error fetching data:", error);
      });
  };

  const updateStatus = (orderId, orderNumber, status) => {
    console.log(orderNumber, status);
    const data = {
      orderNumber,
      status,
    };
    axios
      .put(`${nodeAPIUrl}/orders/change-status/${orderId}`, data)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data) {
          console.log(result?.data, "dadaddadaad");
          const { _id = "" } = result?.data || {};
          const rowNode = gridApi.getRowNode(_id);
          rowNode.updateData(result?.data);
          gridApi.flashCells({ rowNodes: [rowNode] });
          console.log("success");
        } else {
          console.log("error");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const handleSearch = (e) => {
    const {
      target: { value = "" },
    } = e;
    setSearchVal("");
    gridApi.setQuickFilter(value);
    setSearchVal(value);
  };

  const handleSelectionChange = () => {
    if (gridApi?.getSelectedNodes) {
      const nodes = gridApi.getSelectedNodes();
      const order = nodes?.[0]?.data || null;
      setSelectedOrder(order);
    }
  };
  useEffect(() => {
    getOrders();
  }, []);

  return (
    <Card size="small" className="w-full h-[90%] p-2">
      <div
        style={{ top: 0, bottom: 0, left: 0, right: 0 }}
        className="ag-theme-quartz absolute flex gap-4 p-4"
      >
        <Card
          className="w-8/12 h-full relative"
          size="small"
          title="Order List"
          extra={
            <div className="flex items-center gap-2">
              <TextField
                size="small"
                label="Search"
                value={searchValue}
                onChange={handleSearch}
                variant="outlined"
              />
              {/* <Button
                onClick={createMode}
                size="small"
                color="success"
                variant="contained"
                className="px-2"
              >
                Add New
              </Button> */}
              <Button
                size="small"
                variant="contained"
                color="secondary"
                onClick={getOrders}
              >
                <RefreshIcon />
              </Button>
            </div>
            // </div>
          }
        >
          <div
            className="absolute ag-theme-quartz p-1"
            style={{ top: "40px", bottom: 0, left: 0, right: 0 }}
          >
            <AgGridReact
              ref={gridApi}
              rowData={rowData}
              onGridReady={onGridReady}
              rowSelection="single"
              defaultColDef={defaultColDef}
              suppressCopyRowsToClipboard
              columnDefs={colDefs}
              masterDetail={true}
              detailCellRendererParams={detailCellRendererParams}
              getContextMenuItems={getContextMenuItems}
              getRowId={getRowId}
              onSelectionChanged={handleSelectionChange}
            />
          </div>
        </Card>
        <Card
          title="Order Details"
          size="small"
          className="h-full w-4/12 relative "
        >
          <div
            className="absolute ag-theme-quartz overflow-auto p-1"
            style={{ top: "40px", bottom: 0, left: 0, right: 0 }}
          >
            <Descriptions
              // title="Order Info"
              layout="vertical"
              bordered
              items={items}
            />
          </div>
        </Card>
      </div>
    </Card>
  );
};

export default Orders;
