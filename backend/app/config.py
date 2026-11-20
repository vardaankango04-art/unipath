"""
UniPath - Navigation & System Configuration
Defines graph constants and map-unit weights for the DSA indoor routing engine.
"""

# STAIR_COST: Placeholder cost in map units for traversing vertical stairs between floors.
# Note: There are two ground-to-first staircases (G_STAIRS_LT2 and G_STAIRS_CL8_DLC) both sharing
# this identical cost. Because both cost the same, Dijkstra selects between the two staircases
# purely based on ground-floor walking distance to the respective staircase.
# All distance totals are expressed in map units, never meters.
STAIR_COST: float = 50.0

