import * as React from "react";

type MouseIconProps = {
  color?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: "butt" | "round" | "square";
  strokeLinejoin?: "miter" | "round" | "bevel";
  size?: number;
};

const MouseIcon = ({
  color = "black",
  stroke = "none",
  strokeWidth = 1,
  strokeLinecap = "round",
  strokeLinejoin = "round",
  size = 256,
}: MouseIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 256 256"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M75.4868 77.1582C102.207 57.8446 121.899 56.0258 129.801 56.2598H129.82L134.049 67.7715C134.048 67.8077 133.903 71.8118 141.168 77.6621C156.837 89.4791 199.12 100.522 199.12 138.062C197.626 168.985 177.322 178.598 168.736 181.298C166.675 181.946 164.524 182.252 162.373 182.252H112.324C109.813 182.252 108.049 179.786 108.859 177.419C111.496 169.679 116.535 154.702 118.209 148.231C120.486 139.411 125.724 128.108 117.121 116.93C106.861 103.349 76.8992 93.7093 74.0552 80.8213C73.7492 79.4353 74.3348 77.9952 75.4868 77.1582ZM108.661 71.6143C105.713 71.6143 103.324 74.0038 103.324 76.9512C103.324 79.8987 105.713 82.2881 108.661 82.2881C111.608 82.2881 113.998 79.8987 113.998 76.9512C113.997 74.0038 111.608 71.6143 108.661 71.6143Z"
      fill={color}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
    />
    <path
      d="M203.575 139.501C209.092 183.466 171.598 221.545 128.065 221.203C88.8426 221.554 53.6256 190.36 52.0596 150.778C51.8886 147.151 52.0956 143.092 52.5546 139.501C52.8966 141.589 53.3736 144.712 53.8506 146.809C60.9786 181.954 91.9026 209.062 128.065 208.819C167.485 208.891 198.877 178.084 203.575 139.492V139.501Z"
      fill={color}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
    />
    <path
      d="M148.261 76.5001C159.445 76.5001 168.511 67.4339 168.511 56.2501C168.511 45.0663 159.445 36 148.261 36C137.077 36 128.011 45.0663 128.011 56.2501C128.011 67.4339 137.077 76.5001 148.261 76.5001Z"
      fill={color}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
    />
  </svg>
);

export default MouseIcon;
