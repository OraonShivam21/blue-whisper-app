import React, { useState } from "react";
import {
  EllipsisVerticalIcon,
  PaperClipIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import { deleteOneOnOneChat } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { ChatListItemInterface } from "../../interfaces/chat";
import { classNames, getChatObjectMetaData, requestHandler } from "../../utils";
