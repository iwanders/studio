// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { ActionButton, makeStyles, Stack, Text, useTheme } from "@fluentui/react";
import { captureException } from "@sentry/core";
import { Component, ErrorInfo, PropsWithChildren, ReactNode, useMemo, useState } from "react";

import { AppError } from "@foxglove/studio-base/util/errors";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    overflow: "hidden",
  },
  header: {
    fontWeight: "bold",
    marginBottom: theme.spacing.s1,
  },
  content: {
    overflow: "auto",
    padding: theme.spacing.s1,
    backgroundColor: theme.palette.neutralLighterAlt,
  },
  stack: {
    fontSize: theme.fonts.small.fontSize,
    marginLeft: theme.spacing.m,
    lineHeight: "1.3em",
  },
  sourceLocation: {
    color: theme.palette.neutralLight,
  },
}));

function sanitizeStack(stack: string) {
  return stack
    .replace(/\s+\(.+\)$/gm, " (some location)")
    .replace(/\s+https?:\/\/.+$/gm, " some location");
}

function ErrorStack({ stack }: { stack: string }) {
  const styles = useStyles();
  const lines = sanitizeStack(stack)
    .trim()
    .replace(/^\s*at /gm, "")
    .split("\n")
    .map((line) => line.trim());
  return (
    <pre className={styles.stack}>
      {lines.map((line, i) => {
        const match = /^(.+)\s(\(.+$)/.exec(line);
        if (!match) {
          return line + "\n";
        }
        return (
          <span key={i}>
            <span>{match[1]} </span>
            <span className={styles.sourceLocation}>{match[2]}</span>
            {"\n"}
          </span>
        );
      })}
    </pre>
  );
}

type PanelErrorDisplayProps = {
  error?: Error;
  errorInfo?: ErrorInfo;
  onDismiss?: () => void;
  onRemovePanel?: () => void;
};

function PanelErrorDisplay(props: PanelErrorDisplayProps) {
  const styles = useStyles();
  const theme = useTheme();

  const { error, errorInfo } = props;

  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const errorDetails = useMemo(() => {
    if (!showErrorDetails) {
      return ReactNull;
    }

    let stackWithoutMessage = error?.stack ?? "";
    const errorString = error?.toString() ?? "";
    if (stackWithoutMessage.startsWith(errorString)) {
      stackWithoutMessage = stackWithoutMessage.substring(errorString.length);
    }

    return (
      <Stack className={styles.content} tokens={{ childrenGap: theme.spacing.m }}>
        <Stack.Item>
          <Text block className={styles.header} variant="large" as="h2">
            Error stack:
          </Text>
          <ErrorStack stack={stackWithoutMessage} />
        </Stack.Item>
        {errorInfo && (
          <Stack.Item>
            <Text block className={styles.header} variant="large" as="h2">
              Component stack:
            </Text>
            <ErrorStack stack={errorInfo.componentStack} />
          </Stack.Item>
        )}
      </Stack>
    );
  }, [showErrorDetails, styles, error, errorInfo, theme]);

  return (
    <Stack className={styles.content} tokens={{ childrenGap: theme.spacing.m }}>
      <Stack.Item>
        <Text block className={styles.header} variant="large" as="h2">
          The panel encountered an unexpected error.
        </Text>
        <ActionButton onClick={props.onDismiss}>Dismiss</ActionButton>
        <ActionButton onClick={props.onRemovePanel}>Remove Panel</ActionButton>
      </Stack.Item>
      <Stack.Item>
        <ActionButton onClick={() => setShowErrorDetails(!showErrorDetails)}>
          {showErrorDetails ? "Hide" : "Show"} Error Details
        </ActionButton>
        {errorDetails}
      </Stack.Item>
    </Stack>
  );
}

type Props = {
  onRemovePanel: () => void;
};

type State = {
  currentError: { error: Error; errorInfo: ErrorInfo } | undefined;
};

export default class PanelErrorBoundary extends Component<PropsWithChildren<Props>, State> {
  override state: State = {
    currentError: undefined,
  };

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    captureException(new AppError(error, errorInfo));
    this.setState({ currentError: { error, errorInfo } });
  }

  override render(): ReactNode {
    if (this.state.currentError) {
      return (
        <PanelErrorDisplay
          error={this.state.currentError?.error}
          errorInfo={this.state.currentError?.errorInfo}
          onDismiss={() => this.setState({ currentError: undefined })}
          onRemovePanel={this.props.onRemovePanel}
        />
      );
    }
    return this.props.children;
  }
}
