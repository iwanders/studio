// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { useCallback } from "react";

import { Time } from "@foxglove/studio";
import { AppSetting } from "@foxglove/studio-base/AppSetting";
import { useAppConfigurationValue } from "@foxglove/studio-base/hooks";
import { TimeDisplayMethod } from "@foxglove/studio-base/types/panels";
import { formatTime } from "@foxglove/studio-base/util/formatTime";
import { formatTimeRaw } from "@foxglove/studio-base/util/time";

export function useTimeFormat(): {
  formatTime: (stamp: Time) => string;
  timeFormat: TimeDisplayMethod;
  setTimeFormat: (format: TimeDisplayMethod) => Promise<void>;
} {
  const [timeFormat, setTimeFormat] = useAppConfigurationValue<string>(AppSetting.TIME_FORMAT);

  const formatTimeCallback = useCallback(
    (stamp: Time) => {
      switch (timeFormat) {
        case "TOD":
          return formatTime(stamp);
        default:
          return formatTimeRaw(stamp);
      }
    },
    [timeFormat],
  );

  return {
    formatTime: formatTimeCallback,
    setTimeFormat,
    timeFormat: timeFormat === "SEC" ? "SEC" : "TOD",
  };
}
