import {
  PaperAirplaneIcon,
  PaperClipIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import { useEffect, useRef, useState } from "react";
import { getChatMessages, getUserChats, sendMessage } from "../api";
