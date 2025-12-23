
/**
 * Enumeration for different entity types in the scene.
 * 
 * Each entity type should be paired with an appropriate DangerLevel:
 * 
 * FISH:
 *   - Type: EntityType.FISH
 *   - DangerLevel: LOW
 *   - Behavior: Harmless schooling fish that flee from predators
 *   - Collision: Avoid same-level fish (separation), flee from sharks/submarines
 * 
 * SHARK:
 *   - Type: EntityType.SHARK
 *   - DangerLevel: MEDIUM
 *   - Behavior: Predator that hunts fish
 *   - Collision: Flee from submarines, avoid other sharks, avoid obstacles
 * 
 * SUBMARINE:
 *   - Type: EntityType.SUBMARINE
 *   - DangerLevel: HIGH
 *   - Behavior: Apex predator/player-controlled entity
 *   - Collision: Avoid other submarines (same level), avoid obstacles
 * 
 * STATIC_OBSTACLE:
 *   - Type: EntityType.STATIC_OBSTACLE
 *   - DangerLevel: NONE (or LOW for minimal box)
 *   - Examples: Seabed elements
 *   - Collision: All moving entities should avoid these
 * 
 * Usage Example:
 *   // Inside a fish definition
 *   this.type = EntityType.FISH;
 *   this.dangerLevel = DangerLevel.LOW;
 * 
 *   // Inside a static obstacle definition
 *   this.type = EntityType.STATIC_OBSTACLE;
 *   this.dangerLevel = DangerLevel.NONE;
 */
const EntityType = Object.freeze({
    FISH: 'fish',
    SHARK: 'shark',
    SUBMARINE: 'submarine',
    STATIC_OBSTACLE: 'static_obstacle'
});

export { EntityType };
