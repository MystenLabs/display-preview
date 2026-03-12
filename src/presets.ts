// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { Network } from "./sui";

export interface Preset {
  name: string;
  hint?: string;
  objectId: string;
  network: Network;
  fields: { key: string; value: string }[];
}

export const PRESETS: Preset[] = [
  {
    name: "SuiNS",
    hint: "Nested fields, vector access (tld, domain, subdomain), timestamp transformation",
    network: "mainnet",
    objectId:
      "0xbe0d9b1297154b5329f26552e14e1203071707a49a88859fb85d4d59e243ba35",
    fields: [
      { key: "name", value: "{domain.labels[2u8] | ''}@{domain.labels[1u8]}" },
      { key: "description", value: "SuiNS - Sculpt Your Identity" },
      { key: "link", value: "https://{domain_name}.id" },
      { key: "image_url", value: "https://api-mainnet.suins.io/nfts/{domain_name}/{expiration_timestamp_ms}" },
      { key: "project_url", value: "https://suins.io" },
      { key: "tld", value: "{domain.labels[0u8]}" },
      { key: "domain", value: "{domain.labels[1u8]}" },
      { key: "subdomain", value: "{subdomain.labels[2u8] | 'No subdomain'}" },
      { key: "expires", value: "{expiration_timestamp_ms:ts}" },
    ],
  },
  {
    name: "SuiFren",
    hint: "Dynamic object field access (*_item), vector access, timestamp transformation",
    network: "mainnet",
    objectId:
      "0x7859ac2c04f75be763f9e4639eb6dc4a0148e0c147ebbd325b3552ca47b5b2ca",
    fields: [
      { key: "image_url", value: "https://api-mainnet.suifrens.sui.io/suifrens/{id:hex}/svg" },
      { key: "description", value: "This SuiFren is a Capy born on {birthdate:ts} in {birth_location}" },
      { key: "link", value: "https://suifrens.com/fren/{id:hex}" },
      { key: "project_url", value: "https://suifrens.com" },
      { key: "pattern", value: "{attributes[0u8]}" },
      { key: "main_color", value: "#{attributes[1u8]}" },
      { key: "secondary_color", value: "#{attributes[2u8]}" },
      { key: "eyes", value: "{attributes[3u8]}" },
      { key: "genes", value: "{genes:hex}" },
      { key: "head_item", value: "{id=>[0x7aee872d77cade27e7d9b79bf9c67ac40bfb1b797e8b7438ee73f0af21bb4664::accessories::AccessoryKey('head')].name | 'Not equipped'}" },
      { key: "torso_item", value: "{id=>[0x7aee872d77cade27e7d9b79bf9c67ac40bfb1b797e8b7438ee73f0af21bb4664::accessories::AccessoryKey('torso')].name | 'Not equipped'}" },
      { key: "legs_item", value: "{id=>[0x7aee872d77cade27e7d9b79bf9c67ac40bfb1b797e8b7438ee73f0af21bb4664::accessories::AccessoryKey('legs')].name | 'Not equipped'}" },
    ],
  },
  {
    name: "Prime Machin",
    hint: "VecMap attributes access, nested fields, url building",
    network: "mainnet",
    objectId: "0x0825988fc8b6fd6a01b376a81e6b2fcbb6df6887f872913562b16d0fd38f903b",
    fields: [
      { key: "name", value: "Machin #{number} ({rarity.data.rank})" },
      { key: "image_url", value: "https://img.sm.xyz/{id}/" },
      { key: "description", value: "Prime Machin #{number} manufactured by the Triangle Company." },
      { key: "clothing", value: "{attributes.data.clothing}" },
      { key: "background", value: "{attributes.data.background}" },
      { key: "aura", value: "{attributes.data.aura}" },
      { key: "mask", value: "{attributes.data.mask}" },
      { key: "decal", value: "{attributes.data.decal}" },
      { key: "headwear", value: "{attributes.data.headwear}" },
      { key: "internals", value: "{attributes.data.internals}" },
      { key: "skin", value: "{attributes.data.skin}" },
      { key: "screen", value: "{attributes.data.screen}" },
      { key: "rarity", value: "Class: {rarity.data.class}; Rank: {rarity.data.rank}; Score: {rarity.data.score}" },
    ],
  },
  {
    name: "Empty",
    hint: "Standard Display fields",
    network: "mainnet",
    objectId: "",
    fields: [
      { key: "name", value: "" },
      { key: "description", value: "" },
      { key: "link", value: "" },
      { key: "image_url", value: "" },
      { key: "thumbnail_url", value: "" },
      { key: "project_url", value: "" },
      { key: "creator", value: "" },
    ],
  },
];
