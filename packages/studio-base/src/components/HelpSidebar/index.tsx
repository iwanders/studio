// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Stack, useTheme, Text, Link, ITheme, ITextStyles, ILinkStyles } from "@fluentui/react";
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

const useComponentStyles = (theme: ITheme) =>
  useMemo(
    () => ({
      subheader: {
        root: {
          ...theme.fonts.xSmall,
          display: "block",
          textTransform: "uppercase",
          color: theme.palette.neutralSecondaryAlt,
          letterSpacing: "0.025em",
        },
      } as Partial<ITextStyles>,
      link: {
        root: {
          ...theme.fonts.smallPlus,
          fontSize: 13,
        } as Partial<ILinkStyles>,
      },
    }),
    [theme],
  );

export default function HelpSidebar(): JSX.Element {
  const theme = useTheme();
  const styles = useComponentStyles(theme);
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
      <Stack>
        {!isHomeView && (
          <Stack tokens={{ childrenGap: theme.spacing.s2 }}>
            <button onClick={() => setIsHomeView(true)}>Go home</button>
            {panelInfo?.help != undefined ? (
              <TextContent allowMarkdownHtml={true}>{panelInfo?.help}</TextContent>
            ) : (
              "Panel does not have any documentation details."
            )}
          </Stack>
        )}
        {isHomeView && (
          <Stack tokens={{ childrenGap: theme.spacing.m }}>
            <Stack.Item>
              <Text styles={styles.subheader}>External Resources</Text>
              <Stack tokens={{ padding: `${theme.spacing.m} 0`, childrenGap: theme.spacing.s1 }}>
                {resourceLinks.map((link) => (
                  <Link key={link.text} href={link.url} styles={styles.link}>
                    {link.text}
                  </Link>
                ))}
              </Stack>
            </Stack.Item>

            <Stack.Item>
              <Text styles={styles.subheader}>Panels</Text>
              <Stack tokens={{ padding: `${theme.spacing.m} 0`, childrenGap: theme.spacing.s1 }}>
                {panelLinks.map((link) => (
                  <Link key={link.text} href={link.url} styles={styles.link}>
                    {link.text}
                  </Link>
                ))}
              </Stack>
            </Stack.Item>

            <Stack.Item>
              <Text styles={styles.subheader}>Products</Text>
              <Stack tokens={{ padding: `${theme.spacing.m} 0`, childrenGap: theme.spacing.s1 }}>
                {productLinks.map((link) => (
                  <Link key={link.text} href={link.url} styles={styles.link}>
                    {link.text}
                  </Link>
                ))}
              </Stack>
            </Stack.Item>

            <Stack.Item>
              <Text styles={styles.subheader}>Legal</Text>
              <Stack tokens={{ padding: `${theme.spacing.m} 0`, childrenGap: theme.spacing.s1 }}>
                {legalLinks.map((link) => (
                  <Link key={link.text} href={link.url} styles={styles.link}>
                    {link.text}
                  </Link>
                ))}
              </Stack>
            </Stack.Item>

            <Text>
              Learn more at <Link href="https://foxglove.dev">foxglove.dev</Link>.
            </Text>
          </Stack>
        )}
      </Stack>
    </SidebarContent>
  );
}
