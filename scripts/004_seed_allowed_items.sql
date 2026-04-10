-- Seed allowed items from CSV
INSERT INTO allowed_items (name, rarity, category, icon_url) VALUES
('Advanced ARC Powercell', 'Rare', 'Topside Material', 'https://static.wikia.nocookie.net/arc-raiders/images/3/31/Advanced_ARC_Powercell.png'),
('Advanced Electrical Components', 'Rare', 'Refined Material', 'https://static.wikia.nocookie.net/arc-raiders/images/9/9b/Advanced_Electrical_Components.png'),
('Advanced Mechanical Components', 'Rare', 'Refined Material', 'https://static.wikia.nocookie.net/arc-raiders/images/2/25/Advanced_Mechanical_Components.png'),
('Agave', 'Uncommon', 'Nature', 'https://static.wikia.nocookie.net/arc-raiders/images/4/47/Agave.png'),
('Agave Juice', 'Common', 'Quick Use', 'https://static.wikia.nocookie.net/arc-raiders/images/a/a8/Agave_Juice.png'),
('Air Freshener', 'Uncommon', 'Trinket', 'https://static.wikia.nocookie.net/arc-raiders/images/0/03/Air_Freshener.png'),
('Alarm Clock', 'Rare', 'Recyclable', 'https://static.wikia.nocookie.net/arc-raiders/images/9/95/Alarm_Clock.png'),
('Antiseptic', 'Rare', 'Refined Material', 'https://static.wikia.nocookie.net/arc-raiders/images/f/f5/Antiseptic.png'),
('Apricot', 'Uncommon', 'Nature', 'https://static.wikia.nocookie.net/arc-raiders/images/f/fc/Apricot.png'),
('ARC Alloy', 'Uncommon', 'Topside Material', 'https://static.wikia.nocookie.net/arc-raiders/images/a/a6/ARC_Alloy.png'),
('ARC Circuitry', 'Rare', 'Topside Material', 'https://static.wikia.nocookie.net/arc-raiders/images/d/dc/ARC_Circuitry.png'),
('ARC Coolant', 'Rare', 'Recyclable', 'https://static.wikia.nocookie.net/arc-raiders/images/e/e9/ARC_Coolant.png'),
('ARC Flex Rubber', 'Rare', 'Recyclable', 'https://static.wikia.nocookie.net/arc-raiders/images/2/29/ARC_Flex_Rubber.png'),
('ARC Motion Core', 'Rare', 'Topside Material', 'https://static.wikia.nocookie.net/arc-raiders/images/a/ad/ARC_Motion_Core.png'),
('ARC Performance Steel', 'Rare', 'Recyclable', 'https://static.wikia.nocookie.net/arc-raiders/images/0/02/ARC_Performance_Steel.png'),
('ARC Powercell', 'Common', 'Misc', 'https://static.wikia.nocookie.net/arc-raiders/images/d/df/ARC_Powercell.png'),
('ARC Synthetic Resin', 'Rare', 'Recyclable', 'https://static.wikia.nocookie.net/arc-raiders/images/7/72/ARC_Synthetic_Resin.png'),
('ARC Thermo Lining', 'Rare', 'Recyclable', 'https://static.wikia.nocookie.net/arc-raiders/images/0/0f/ARC_Thermo_Lining.png'),
('Assorted Seeds', 'Common', 'Nature', 'https://static.wikia.nocookie.net/arc-raiders/images/5/51/Assorted_Seeds.png'),
('Bastion Cell', 'Epic', 'Recyclable', 'https://static.wikia.nocookie.net/arc-raiders/images/0/06/Bastion_Cell.png')
ON CONFLICT (name) DO NOTHING;
