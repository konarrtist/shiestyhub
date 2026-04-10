-- =====================================================
-- ARC RAIDERS MARKETPLACE - SEED ITEMS DATA
-- =====================================================
-- Run after 001_complete_schema.sql
-- =====================================================

-- Clear existing items
TRUNCATE allowed_items;

-- =====================================================
-- WEAPONS
-- =====================================================

INSERT INTO allowed_items (name, rarity, category, icon_url) VALUES
-- Common Weapons
('Rusty Pistol', 'Common', 'Weapons', '/placeholder.svg?height=64&width=64'),
('Scrap Rifle', 'Common', 'Weapons', '/placeholder.svg?height=64&width=64'),
('Makeshift Shotgun', 'Common', 'Weapons', '/placeholder.svg?height=64&width=64'),
('Basic SMG', 'Common', 'Weapons', '/placeholder.svg?height=64&width=64'),

-- Uncommon Weapons
('Combat Pistol', 'Uncommon', 'Weapons', '/placeholder.svg?height=64&width=64'),
('Assault Rifle', 'Uncommon', 'Weapons', '/placeholder.svg?height=64&width=64'),
('Tactical Shotgun', 'Uncommon', 'Weapons', '/placeholder.svg?height=64&width=64'),
('Compact SMG', 'Uncommon', 'Weapons', '/placeholder.svg?height=64&width=64'),

-- Rare Weapons
('Precision Rifle', 'Rare', 'Weapons', '/placeholder.svg?height=64&width=64'),
('Heavy Machine Gun', 'Rare', 'Weapons', '/placeholder.svg?height=64&width=64'),
('Auto Shotgun', 'Rare', 'Weapons', '/placeholder.svg?height=64&width=64'),
('Burst Rifle', 'Rare', 'Weapons', '/placeholder.svg?height=64&width=64'),

-- Epic Weapons
('Plasma Rifle', 'Epic', 'Weapons', '/placeholder.svg?height=64&width=64'),
('Railgun', 'Epic', 'Weapons', '/placeholder.svg?height=64&width=64'),
('Energy Shotgun', 'Epic', 'Weapons', '/placeholder.svg?height=64&width=64'),
('Arc Cannon', 'Epic', 'Weapons', '/placeholder.svg?height=64&width=64'),

-- Legendary Weapons
('Void Reaper', 'Legendary', 'Weapons', '/placeholder.svg?height=64&width=64'),
('Thunder Strike', 'Legendary', 'Weapons', '/placeholder.svg?height=64&width=64'),
('Quantum Rifle', 'Legendary', 'Weapons', '/placeholder.svg?height=64&width=64'),
('Devastator', 'Legendary', 'Weapons', '/placeholder.svg?height=64&width=64');

-- =====================================================
-- ARMOR
-- =====================================================

INSERT INTO allowed_items (name, rarity, category, icon_url) VALUES
-- Common Armor
('Scrap Helmet', 'Common', 'Armor', '/placeholder.svg?height=64&width=64'),
('Makeshift Vest', 'Common', 'Armor', '/placeholder.svg?height=64&width=64'),
('Basic Boots', 'Common', 'Armor', '/placeholder.svg?height=64&width=64'),
('Cloth Gloves', 'Common', 'Armor', '/placeholder.svg?height=64&width=64'),

-- Uncommon Armor
('Combat Helmet', 'Uncommon', 'Armor', '/placeholder.svg?height=64&width=64'),
('Tactical Vest', 'Uncommon', 'Armor', '/placeholder.svg?height=64&width=64'),
('Military Boots', 'Uncommon', 'Armor', '/placeholder.svg?height=64&width=64'),
('Combat Gloves', 'Uncommon', 'Armor', '/placeholder.svg?height=64&width=64'),

-- Rare Armor
('Reinforced Helmet', 'Rare', 'Armor', '/placeholder.svg?height=64&width=64'),
('Ballistic Vest', 'Rare', 'Armor', '/placeholder.svg?height=64&width=64'),
('Heavy Boots', 'Rare', 'Armor', '/placeholder.svg?height=64&width=64'),
('Armored Gloves', 'Rare', 'Armor', '/placeholder.svg?height=64&width=64'),

-- Epic Armor
('Nano Helmet', 'Epic', 'Armor', '/placeholder.svg?height=64&width=64'),
('Energy Shield Vest', 'Epic', 'Armor', '/placeholder.svg?height=64&width=64'),
('Gravity Boots', 'Epic', 'Armor', '/placeholder.svg?height=64&width=64'),
('Power Gloves', 'Epic', 'Armor', '/placeholder.svg?height=64&width=64'),

-- Legendary Armor
('Void Walker Helmet', 'Legendary', 'Armor', '/placeholder.svg?height=64&width=64'),
('Arc Shield', 'Legendary', 'Armor', '/placeholder.svg?height=64&width=64'),
('Phase Boots', 'Legendary', 'Armor', '/placeholder.svg?height=64&width=64'),
('Titan Gauntlets', 'Legendary', 'Armor', '/placeholder.svg?height=64&width=64');

-- =====================================================
-- RESOURCES
-- =====================================================

INSERT INTO allowed_items (name, rarity, category, icon_url) VALUES
-- Common Resources
('Scrap Metal', 'Common', 'Resources', '/placeholder.svg?height=64&width=64'),
('Basic Components', 'Common', 'Resources', '/placeholder.svg?height=64&width=64'),
('Raw Materials', 'Common', 'Resources', '/placeholder.svg?height=64&width=64'),
('Salvage Parts', 'Common', 'Resources', '/placeholder.svg?height=64&width=64'),

-- Uncommon Resources
('Refined Metal', 'Uncommon', 'Resources', '/placeholder.svg?height=64&width=64'),
('Electronic Parts', 'Uncommon', 'Resources', '/placeholder.svg?height=64&width=64'),
('Polymer Sheets', 'Uncommon', 'Resources', '/placeholder.svg?height=64&width=64'),
('Circuit Boards', 'Uncommon', 'Resources', '/placeholder.svg?height=64&width=64'),

-- Rare Resources
('Advanced Alloy', 'Rare', 'Resources', '/placeholder.svg?height=64&width=64'),
('Power Cells', 'Rare', 'Resources', '/placeholder.svg?height=64&width=64'),
('Nano Fibers', 'Rare', 'Resources', '/placeholder.svg?height=64&width=64'),
('Quantum Chips', 'Rare', 'Resources', '/placeholder.svg?height=64&width=64'),

-- Epic Resources
('Void Crystal', 'Epic', 'Resources', '/placeholder.svg?height=64&width=64'),
('Arc Core', 'Epic', 'Resources', '/placeholder.svg?height=64&width=64'),
('Plasma Container', 'Epic', 'Resources', '/placeholder.svg?height=64&width=64'),
('Dark Matter Shard', 'Epic', 'Resources', '/placeholder.svg?height=64&width=64'),

-- Legendary Resources
('Primordial Essence', 'Legendary', 'Resources', '/placeholder.svg?height=64&width=64'),
('Void Heart', 'Legendary', 'Resources', '/placeholder.svg?height=64&width=64'),
('Arc Fragment', 'Legendary', 'Resources', '/placeholder.svg?height=64&width=64'),
('Cosmic Core', 'Legendary', 'Resources', '/placeholder.svg?height=64&width=64');

-- =====================================================
-- BLUEPRINTS
-- =====================================================

INSERT INTO allowed_items (name, rarity, category, icon_url) VALUES
-- Common Blueprints
('Basic Pistol Blueprint', 'Common', 'Blueprints', '/placeholder.svg?height=64&width=64'),
('Scrap Armor Blueprint', 'Common', 'Blueprints', '/placeholder.svg?height=64&width=64'),
('Simple Tool Blueprint', 'Common', 'Blueprints', '/placeholder.svg?height=64&width=64'),

-- Uncommon Blueprints
('Combat Rifle Blueprint', 'Uncommon', 'Blueprints', '/placeholder.svg?height=64&width=64'),
('Tactical Gear Blueprint', 'Uncommon', 'Blueprints', '/placeholder.svg?height=64&width=64'),
('Advanced Tool Blueprint', 'Uncommon', 'Blueprints', '/placeholder.svg?height=64&width=64'),

-- Rare Blueprints
('Precision Weapon Blueprint', 'Rare', 'Blueprints', '/placeholder.svg?height=64&width=64'),
('Heavy Armor Blueprint', 'Rare', 'Blueprints', '/placeholder.svg?height=64&width=64'),
('Gadget Blueprint', 'Rare', 'Blueprints', '/placeholder.svg?height=64&width=64'),

-- Epic Blueprints
('Energy Weapon Blueprint', 'Epic', 'Blueprints', '/placeholder.svg?height=64&width=64'),
('Nano Armor Blueprint', 'Epic', 'Blueprints', '/placeholder.svg?height=64&width=64'),
('Advanced Gadget Blueprint', 'Epic', 'Blueprints', '/placeholder.svg?height=64&width=64'),

-- Legendary Blueprints
('Legendary Weapon Blueprint', 'Legendary', 'Blueprints', '/placeholder.svg?height=64&width=64'),
('Legendary Armor Blueprint', 'Legendary', 'Blueprints', '/placeholder.svg?height=64&width=64'),
('Ultimate Gadget Blueprint', 'Legendary', 'Blueprints', '/placeholder.svg?height=64&width=64');

-- =====================================================
-- GADGETS
-- =====================================================

INSERT INTO allowed_items (name, rarity, category, icon_url) VALUES
-- Common Gadgets
('Flashlight', 'Common', 'Gadgets', '/placeholder.svg?height=64&width=64'),
('Basic Scanner', 'Common', 'Gadgets', '/placeholder.svg?height=64&width=64'),
('Repair Kit', 'Common', 'Gadgets', '/placeholder.svg?height=64&width=64'),

-- Uncommon Gadgets
('Motion Sensor', 'Uncommon', 'Gadgets', '/placeholder.svg?height=64&width=64'),
('Med Kit', 'Uncommon', 'Gadgets', '/placeholder.svg?height=64&width=64'),
('Grappling Hook', 'Uncommon', 'Gadgets', '/placeholder.svg?height=64&width=64'),

-- Rare Gadgets
('Drone', 'Rare', 'Gadgets', '/placeholder.svg?height=64&width=64'),
('Shield Generator', 'Rare', 'Gadgets', '/placeholder.svg?height=64&width=64'),
('Cloaking Device', 'Rare', 'Gadgets', '/placeholder.svg?height=64&width=64'),

-- Epic Gadgets
('Holographic Decoy', 'Epic', 'Gadgets', '/placeholder.svg?height=64&width=64'),
('Teleporter', 'Epic', 'Gadgets', '/placeholder.svg?height=64&width=64'),
('EMP Device', 'Epic', 'Gadgets', '/placeholder.svg?height=64&width=64'),

-- Legendary Gadgets
('Time Dilator', 'Legendary', 'Gadgets', '/placeholder.svg?height=64&width=64'),
('Void Portal', 'Legendary', 'Gadgets', '/placeholder.svg?height=64&width=64'),
('Arc Summoner', 'Legendary', 'Gadgets', '/placeholder.svg?height=64&width=64');

-- =====================================================
-- CONSUMABLES
-- =====================================================

INSERT INTO allowed_items (name, rarity, category, icon_url) VALUES
-- Common Consumables
('Health Pack', 'Common', 'Consumables', '/placeholder.svg?height=64&width=64'),
('Energy Drink', 'Common', 'Consumables', '/placeholder.svg?height=64&width=64'),
('Bandages', 'Common', 'Consumables', '/placeholder.svg?height=64&width=64'),

-- Uncommon Consumables
('Stim Pack', 'Uncommon', 'Consumables', '/placeholder.svg?height=64&width=64'),
('Shield Booster', 'Uncommon', 'Consumables', '/placeholder.svg?height=64&width=64'),
('Adrenaline Shot', 'Uncommon', 'Consumables', '/placeholder.svg?height=64&width=64'),

-- Rare Consumables
('Nano Med', 'Rare', 'Consumables', '/placeholder.svg?height=64&width=64'),
('Power Surge', 'Rare', 'Consumables', '/placeholder.svg?height=64&width=64'),
('Combat Enhancer', 'Rare', 'Consumables', '/placeholder.svg?height=64&width=64'),

-- Epic Consumables
('Regeneration Serum', 'Epic', 'Consumables', '/placeholder.svg?height=64&width=64'),
('Void Energy', 'Epic', 'Consumables', '/placeholder.svg?height=64&width=64'),
('Ultimate Stim', 'Epic', 'Consumables', '/placeholder.svg?height=64&width=64'),

-- Legendary Consumables
('Phoenix Elixir', 'Legendary', 'Consumables', '/placeholder.svg?height=64&width=64'),
('God Mode Serum', 'Legendary', 'Consumables', '/placeholder.svg?height=64&width=64'),
('Arc Infusion', 'Legendary', 'Consumables', '/placeholder.svg?height=64&width=64');
