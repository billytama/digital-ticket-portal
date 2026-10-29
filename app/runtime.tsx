"use client";
import { createContext, useContext } from "react";
export const RuntimeContext=createContext({readOnly:false,uploadsEnabled:true});
export const useRuntime=()=>useContext(RuntimeContext);
