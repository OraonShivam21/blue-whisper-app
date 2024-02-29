import { Fragment, useEffect, useState } from "react";
import { Dialog, Switch, Transition } from "@headlessui/react";
import {
  UserGroupIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { createGroupChat, createUserChat, getAvailableUsers } from "../../api";
import { ChatListenItemInterface } from "../../interfaces/chat";
import { UserInterface } from "../../interfaces/user";
import { classNames, requestHandler } from "../../utils";
import Button from "../Button";
import Input from "../Input";
import Select from "../Select";
