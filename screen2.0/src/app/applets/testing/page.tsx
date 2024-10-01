"use client";

import React from 'react'
import {  Typography } from "@mui/material"
import { Umap } from './chart'
import { ParentSize } from '@visx/responsive';


export default function Testing() {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
          <div style={{
              height: '50vh',
              width: '50vw',
              position: 'relative',
          }}>
            <ParentSize>
              {({ width, height }) => <Umap width={width} height={height} />}
            </ParentSize>
          </div>
        </div>
    );
  }