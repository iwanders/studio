// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Stack, useTheme, Text, Link } from "@fluentui/react";
import { useMemo, useEffect, useState } from "react";
import { useUnmount } from "react-use";

import { SidebarContent } from "@foxglove/studio-base/components/SidebarContent";
import { useSelectedPanels } from "@foxglove/studio-base/context/CurrentLayoutContext";
import { getPanelTypeFromId } from "@foxglove/studio-base/util/layout";

const resourceLinks = [
  { text: "Download app", url: "https://foxglove.dev/download" },
  { text: "Read docs", url: "https://foxglove.dev/docs" },
  { text: "Join our community", url: "https://foxglove.dev/community" },
  { text: "Browse paid plans", url: "https://foxglove.dev/pricing" },
];

const productLinks = [
  { text: "Foxglove Studio", url: "https://foxglove.dev/studio" },
  { text: "Foxglove Data Platform", url: "https://foxglove.dev/data-platform" },
];

const legalLinks = [
  { text: "License", url: "https://foxglove.dev/legal/studio-license" },
  { text: "Privacy", url: "https://foxglove.dev/legal/privacy" },
];

export default function HelpSidebar(): React.ReactElement {
  const theme = useTheme();
  const [helpContent, setHelpContent] = useState("");
  const { selectedPanelIds, setSelectedPanelIds } = useSelectedPanels();
  const selectedPanelId = useMemo(
    () => (selectedPanelIds.length === 1 ? selectedPanelIds[0] : undefined),
    [selectedPanelIds],
  );
  const panelType = useMemo(
    () => (selectedPanelId != undefined ? getPanelTypeFromId(selectedPanelId) : undefined),
    [selectedPanelId],
  );

  useEffect(() => {
    const getHelpContent = async () => {
      const fetchedContent = await import(
        `@foxglove/studio-base/panels/${panelType}/index.help.md`
      );
      console.log(fetchedContent);
      setHelpContent(fetchedContent);
    };
    getHelpContent();
  }, [panelType]);

  useUnmount(() => {
    // Automatically deselect the panel we were looking at help content for when the help sidebar closes
    if (selectedPanelId != undefined) {
      setSelectedPanelIds([]);
    }
  });

  return (
    <SidebarContent title="Help">
      <Stack tokens={{ childrenGap: 30 }}>
        <Stack.Item>
          <Stack tokens={{ childrenGap: theme.spacing.s1 }}>
            {helpContent}
            <h3>Resources</h3>
            <ul>
              {resourceLinks.map((link) => (
                <li key={link.text}>
                  <Link href={link.url}>{link.text}</Link>
                </li>
              ))}
            </ul>

            <h3>Products</h3>
            <ul>
              {productLinks.map((link) => (
                <li key={link.text}>
                  <Link href={link.url}>{link.text}</Link>
                </li>
              ))}
            </ul>

            <h3>Legal</h3>
            <ul>
              {legalLinks.map((link) => (
                <li key={link.text}>
                  <Link href={link.url}>{link.text}</Link>
                </li>
              ))}
            </ul>
            <Text>
              Learn more at <Link href="https://foxglove.dev">foxglove.dev</Link>.
            </Text>
          </Stack>
        </Stack.Item>
      </Stack>
    </SidebarContent>
  );
}
