import React, { useState, useMemo, useEffect } from "react";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardActions from "@mui/joy/CardActions";
import CircularProgress from "@mui/joy/CircularProgress";
import Typography from "@mui/joy/Typography";
import SvgIcon from "@mui/joy/SvgIcon";
import axios from "axios";
import { Table } from "antd";
import moment from "moment";
const nodeAPIUrl = `http://localhost:5000/api/v1`;

export default function Homepage() {
  const [productList, setProductList] = useState([]);
  console.log("2024-03-15 11:30:00+00:00");
  const date = "2024-03-15 11:30:00+00:00";
  const date2 = moment(date).format("MM/DD/YYYY");
  console.log(date2);

  const columns = [
    {
      title: "SKU",
      dataIndex: "sku",
      width: 200,
    },
    {
      title: "Code",
      dataIndex: "code",
      width: 200,
    },
    {
      title: "Product Name",
      dataIndex: "title",
      width: 350,
    },
    {
      title: "Brand",
      dataIndex: "brand",
      width: 150,
      render: (val) => <a>{val === true ? "Kit" : " Single"}</a>,
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 100,
      render: (val) => {
        if (Number(val) > 0) return `Rs${parseFloat(Number(val)).toFixed(2)}`;
        if (Number(val) < 0) return `-Rs${parseFloat(Number(val)).toFixed(2)}`;
        return "";
      },
    },
  ];

  const getAllProducts = () => {
    // if (gridApi && gridApi?.showLoadingOverlay) gridApi.showLoadingOverlay();
    axios
      .get(`${nodeAPIUrl}/product/get-all-product`)
      .then((response) => response.data)
      .then((result) => {
        if (result?.data && result?.data?.length) {
          setProductList(result?.data);
          // if (gridApi && gridApi?.hideOverlay) gridApi.hideOverlay();
        } else {
          setProductList([]);
          // if (gridApi && gridApi?.showNoRowsOverlay)
          //   gridApi.showNoRowsOverlay();
        }
      })
      .catch((error) => {
        // if (gridApi && gridApi?.showNoRowsOverlay) gridApi.showNoRowsOverlay();
        console.error(error);
      });
  };

  React.useEffect(() => {
    getAllProducts();
  }, []);

  return (
    <div className="w-full h-[90%] overflow-auto py-5 flex justify-center">
      <div className="w-8/12 flex flex-col gap-4">
        <div className="w-full flex items-center gap-4">
          <Card
            className="w-full"
            variant="outlined"
            color="success"
            invertedColors
          >
            <CardContent orientation="horizontal">
              <CircularProgress
                color="success"
                size="lg"
                determinate
                value={20}
              >
                <SvgIcon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                    />
                  </svg>
                </SvgIcon>
              </CircularProgress>
              <CardContent>
                <Typography level="body-md">Gross profit</Typography>
                <Typography level="h2">Rs. 12,322</Typography>
              </CardContent>
            </CardContent>
            <CardActions>
              <Button color="success" variant="soft" size="sm">
                Manage Inventory
              </Button>
              <Button color="success" variant="solid" size="sm">
                Goto Orders
              </Button>
            </CardActions>
          </Card>{" "}
          <Card
            className="w-full"
            variant="outlined"
            color="neutral"
            invertedColors
          >
            <CardContent orientation="horizontal">
              <CircularProgress
                color="warning"
                size="lg"
                determinate
                value={20}
              >
                <SvgIcon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                    />
                  </svg>
                </SvgIcon>
              </CircularProgress>
              <CardContent>
                <Typography level="body-md">Total Orders</Typography>
                <Typography level="h2">200</Typography>
              </CardContent>
            </CardContent>
            <CardActions>
              <Button color="warning" variant="soft" size="sm">
                Manage Inventory
              </Button>
              <Button color="warning" variant="solid" size="sm">
                Goto Orders
              </Button>
            </CardActions>
          </Card>
        </div>
        <h6 className="font-semibold py-2">Top Seller Items</h6>
        <Table
          columns={columns}
          dataSource={productList}
          scroll={{
            y: 240,
          }}
        />
      </div>
    </div>
  );
}
