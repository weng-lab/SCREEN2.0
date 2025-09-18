import * as React from "react";

type HumanIconProps = {
  color?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: "butt" | "round" | "square";
  strokeLinejoin?: "miter" | "round" | "bevel";
  size?: number;
  halo?: boolean
};

const HumanIcon = ({
  color = "black",
  stroke = "none",
  strokeWidth = 1,
  strokeLinecap = "round",
  strokeLinejoin = "round",
  size = 256,
  halo = true
}: HumanIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 256 256"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M176.723 97.1374V191.854L170.252 176.635C167.579 171.1 165.869 162.451 165.203 156.34L158.723 103.446C158.723 103.446 151.919 133.065 151.226 137.674C149.129 151.678 155.177 164.935 159.308 179.974C163.268 194.374 166.742 208.369 167.768 227.674H135.134L129.023 193.996L122.912 227.674H90.3677C91.4027 208.369 94.8678 193.474 98.7378 179.974C103.04 164.989 108.926 151.678 106.82 137.674C106.136 133.065 99.3228 103.446 99.3228 103.446L92.8427 156.34C92.1767 162.451 90.4667 171.1 87.8027 176.635L81.3228 191.854V97.1374C81.3228 92.9794 82.4478 88.9834 84.4818 85.5274C86.5158 82.0624 89.4498 79.1373 93.0768 77.1033C97.1718 74.8083 101.789 73.6113 106.478 73.6113H151.568C156.257 73.6113 160.874 74.8083 164.969 77.1033C168.596 79.1373 171.539 82.0624 173.573 85.5274C175.598 88.9834 176.723 92.9794 176.723 97.1374Z"
      fill={color}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
    />
    <path
      d="M129.023 68.5001C140.206 68.5001 149.273 59.4339 149.273 48.2501C149.273 37.0663 140.206 28 129.023 28C117.839 28 108.773 37.0663 108.773 48.2501C108.773 59.4339 117.839 68.5001 129.023 68.5001Z"
      fill={color}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
    />
    <path
      d="M76.5261 62.0742C49.2921 97.2373 42.2991 144.388 56.3211 186.095C60.9561 199.847 67.9851 212.861 77.5161 224.975C70.8471 221.06 64.9071 215.822 59.7231 209.909C23.2731 168.14 28.7901 93.0433 76.5261 62.0742Z"
      fill={!halo ? "transparent" : color}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
    />
    <path
      d="M181.52 62.0742C229.256 93.0523 234.764 168.131 198.323 209.909C193.139 215.831 187.199 221.06 180.53 224.975C190.061 212.861 197.09 199.838 201.725 186.095C215.756 144.388 208.754 97.2463 181.52 62.0742Z"
      fill={!halo ? "transparent" : color}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
    />
  </svg>
);

export default HumanIcon;
