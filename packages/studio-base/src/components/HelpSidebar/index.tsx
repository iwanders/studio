// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Stack, useTheme, Text, Link } from "@fluentui/react";
import { useMemo, useState, useEffect } from "react";
import { useUnmount } from "react-use";

import { SidebarContent } from "@foxglove/studio-base/components/SidebarContent";
import TextContent from "@foxglove/studio-base/components/TextContent";
import { useSelectedPanels } from "@foxglove/studio-base/context/CurrentLayoutContext";
import { usePanelCatalog } from "@foxglove/studio-base/context/PanelCatalogContext";
import { getPanelTypeFromId } from "@foxglove/studio-base/util/layout";

const resourceLinks = [
  { text: "Download app", url: "https://foxglove.dev/download" },
  { text: "Read docs", url: "https://foxglove.dev/docs" },
  { text: "Join our community", url: "https://foxglove.dev/community" },
  { text: "Browse paid plans", url: "https://foxglove.dev/pricing" },
];

const panelLinks = [
  { text: "3D", url: "" },
  { text: "Diagnostics – Detail", url: "" },
  { text: "Diagnostics – Summary", url: "" },
  { text: "Image", url: "" },
  { text: "Teleop", url: "" },
  { text: "Map", url: "" },
  { text: "Parameters", url: "" },
  { text: "Plot", url: "" },
  { text: "Publish", url: "" },
  { text: "Raw Messages", url: "" },
  { text: "Log", url: "" },
  { text: "State Transitions", url: "" },
  { text: "Table", url: "" },
  { text: "URDF Viewer", url: "" },
  { text: "Topic Graph", url: "" },
  { text: "Data Source", url: "" },
  { text: "Variable Slider", url: "" },
  { text: "Node Playground", url: "" },
  { text: "Tab", url: "" },
  { text: "Studio - Playback Performance", url: "" },
  { text: "Studio - Internals", url: "" },
  { text: "Studio - Logs", url: "" },
];

const productLinks = [
  { text: "Foxglove Studio", url: "https://foxglove.dev/studio" },
  { text: "Foxglove Data Platform", url: "https://foxglove.dev/data-platform" },
];

const legalLinks = [
  { text: "License", url: "https://foxglove.dev/legal/studio-license" },
  { text: "Privacy", url: "https://foxglove.dev/legal/privacy" },
];

export default function HelpSidebar(): JSX.Element {
  const theme = useTheme();
  const [isHomeView, setIsHomeView] = useState(true);
  const { selectedPanelIds, setSelectedPanelIds } = useSelectedPanels();
  const selectedPanelId = useMemo(
    () => (selectedPanelIds.length === 1 ? selectedPanelIds[0] : undefined),
    [selectedPanelIds],
  );
  const panelType = useMemo(
    () => (selectedPanelId != undefined ? getPanelTypeFromId(selectedPanelId) : undefined),
    [selectedPanelId],
  );

  const panelCatalog = usePanelCatalog();
  const panelInfo = useMemo(
    () => (panelType != undefined ? panelCatalog.getPanelByType(panelType) : undefined),
    [panelCatalog, panelType],
  );

  useEffect(() => {
    if (panelInfo) {
      setIsHomeView(false);
    } else {
      setIsHomeView(true);
    }
  }, [panelInfo]);

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
            {!isHomeView && (
              <>
                <Stack.Item>
                  <Stack tokens={{ childrenGap: theme.spacing.s1 }}>
                    <button onClick={() => setIsHomeView(true)}>Go home</button>
                  </Stack>
                </Stack.Item>
                {panelInfo?.help != undefined ? (
                  <TextContent allowMarkdownHtml={true}>{panelInfo?.help}</TextContent>
                ) : (
                  "Panel does not have any documentation details."
                )}
              </>
            )}
            {isHomeView && (
              <>
                <h3>Resources</h3>
                <ul>
                  {resourceLinks.map((link) => (
                    <li key={link.text}>
                      <Link href={link.url}>{link.text}</Link>
                    </li>
                  ))}
                </ul>

                <h3>Panels</h3>
                <ul>
                  {panelLinks.map((link) => (
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
              </>
            )}
          </Stack>
        </Stack.Item>
      </Stack>
    </SidebarContent>
  );
}
