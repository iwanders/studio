// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
//
// This file incorporates work covered by the following copyright and
// permission notice:
//
//   Copyright 2019-2021 Cruise LLC
//
//   This source code is licensed under the Apache License, Version 2.0,
//   found at http://www.apache.org/licenses/LICENSE-2.0
//   You may not use this file except in compliance with the License.
import { ReactElement, useMemo } from "react";

import Logger from "@foxglove/log";
import { CommonCommandProps, GLTFScene, parseGLB } from "@foxglove/regl-worldview";
import { AppSetting } from "@foxglove/studio-base/AppSetting";
import { rewritePackageUrl } from "@foxglove/studio-base/context/AssetsContext";
import { useAppConfigurationValue } from "@foxglove/studio-base/hooks/useAppConfigurationValue";
import notFoundModelURL from "@foxglove/studio-base/panels/ThreeDimensionalViz/commands/404.glb";
import { GlbModel } from "@foxglove/studio-base/panels/ThreeDimensionalViz/utils/GlbModel";
import { parseDaeToGlb } from "@foxglove/studio-base/panels/ThreeDimensionalViz/utils/parseDaeToGlb";
import { parseStlToGlb } from "@foxglove/studio-base/panels/ThreeDimensionalViz/utils/parseStlToGlb";
import { MeshMarker } from "@foxglove/studio-base/types/Messages";

const log = Logger.getLogger(__filename);

type MeshMarkerProps = CommonCommandProps & {
  markers: MeshMarker[];
};

async function loadNotFoundModel(): Promise<GlbModel> {
  const response = await fetch(notFoundModelURL);
  if (!response.ok) {
    throw new Error(`Unable to load 404.glb: ${response.status}`);
  }
  return (await parseGLB(await response.arrayBuffer())) as GlbModel;
}

async function loadModel(url: string): Promise<GlbModel | undefined> {
  const GLB_MAGIC = 0x676c5446; // "glTF"

  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength < 4) {
      throw new Error(`${buffer.byteLength} bytes received`);
    }
    const view = new DataView(buffer);

    // Check if this is a glTF .glb file
    if (GLB_MAGIC === view.getUint32(0, false)) {
      return (await parseGLB(buffer)) as GlbModel;
    }

    // STL binary files don't have a header, so we have to rely on the file extension
    if (url.endsWith(".stl")) {
      return parseStlToGlb(buffer);
    }

    if (url.endsWith(".dae")) {
      return await parseDaeToGlb(buffer);
    }
  } catch (err) {
    log.error(`Failed to load model from ${url}: ${err.message}`);
  }

  return await loadNotFoundModel();
}

class ModelCache {
  private models = new Map<string, Promise<GlbModel | undefined>>();

  async load(url: string): Promise<GlbModel | undefined> {
    let promise = this.models.get(url);
    if (promise) {
      return await promise;
    }
    promise = loadModel(url);
    this.models.set(url, promise);
    return await promise;
  }
}

function MeshMarkers({ markers, layerIndex }: MeshMarkerProps): ReactElement {
  const models: React.ReactNode[] = [];

  const modelCache = useMemo(() => new ModelCache(), []);
  const [rosPackagePath] = useAppConfigurationValue<string>(AppSetting.ROS_PACKAGE_PATH);

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i]!;
    const { pose, mesh_resource, scale, color } = marker;
    if (!mesh_resource) {
      continue;
    }
    const url = rewritePackageUrl(mesh_resource, { rosPackagePath });
    const alpha = (color?.a ?? 0) > 0 ? color!.a : 1;

    models.push(
      <GLTFScene key={i} layerIndex={layerIndex} model={async () => await modelCache.load(url)}>
        {{ pose, scale, alpha, interactionData: undefined }}
      </GLTFScene>,
    );
  }

  return <>{...models}</>;
}

export default MeshMarkers;
