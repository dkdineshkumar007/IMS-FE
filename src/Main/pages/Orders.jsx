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

const nodeAPIUrl = `http://localhost:5000/api/v1`;

const Orders = () => {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
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
    },
    { field: "shipByDate", width: 200 },
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
  });

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

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <Card title="Orders" className="w-full h-[90%] relative p-2">
      <div
        style={{ top: "57px", bottom: 0, left: 0, right: 0 }}
        className="ag-theme-quartz absolute p-4"
      >
        <AgGridReact
          ref={gridApi}
          rowData={rowData}
          onGridReady={onGridReady}
          rowSelection="single"
          defaultColDef={defaultColDef}
          columnDefs={colDefs}
          masterDetail={true}
          detailCellRendererParams={detailCellRendererParams}
          getContextMenuItems={getContextMenuItems}
          getRowId={getRowId}
        />
      </div>
    </Card>
  );
};

export default Orders;
