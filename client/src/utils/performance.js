// Performance monitoring utility for SRS compliance
class PerformanceMonitor {
  constructor() {
    this.interactions = [];
    this.threshold = 2000; // 2 seconds in milliseconds
  }

  // Start timing an interaction
  startTimer(interactionName) {
    const startTime = performance.now();
    return {
      name: interactionName,
      startTime,
      end: () => this.endTimer(interactionName, startTime)
    };
  }

  // End timing an interaction
  endTimer(interactionName, startTime) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const interaction = {
      name: interactionName,
      duration,
      timestamp: new Date().toISOString(),
      isWithinThreshold: duration <= this.threshold
    };

    this.interactions.push(interaction);
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`⏱️ ${interactionName}: ${duration.toFixed(2)}ms ${interaction.isWithinThreshold ? '✅' : '❌'}`);
    }

    return interaction;
  }

  // Get performance statistics
  getStats() {
    const totalInteractions = this.interactions.length;
    const withinThreshold = this.interactions.filter(i => i.isWithinThreshold).length;
    const percentage = totalInteractions > 0 ? (withinThreshold / totalInteractions) * 100 : 0;
    
    const avgDuration = this.interactions.reduce((sum, i) => sum + i.duration, 0) / totalInteractions;
    const maxDuration = Math.max(...this.interactions.map(i => i.duration));
    const minDuration = Math.min(...this.interactions.map(i => i.duration));

    return {
      totalInteractions,
      withinThreshold,
      percentage: percentage.toFixed(2),
      averageDuration: avgDuration.toFixed(2),
      maxDuration: maxDuration.toFixed(2),
      minDuration: minDuration.toFixed(2),
      meetsSRSRequirement: percentage >= 95
    };
  }

  // Export data for analysis
  exportData() {
    return {
      interactions: this.interactions,
      stats: this.getStats(),
      timestamp: new Date().toISOString()
    };
  }

  // Clear all data
  clear() {
    this.interactions = [];
  }
}

// Create global instance
const performanceMonitor = new PerformanceMonitor();

// Performance measurement decorator
export const measurePerformance = (interactionName) => {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args) {
      const timer = performanceMonitor.startTimer(interactionName);
      try {
        const result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
          return result.finally(() => timer.end());
        } else {
          timer.end();
          return result;
        }
      } catch (error) {
        timer.end();
        throw error;
      }
    };
    
    return descriptor;
  };
};

// React hook for measuring component interactions
export const usePerformanceMonitor = () => {
  const measureInteraction = (interactionName, callback) => {
    const timer = performanceMonitor.startTimer(interactionName);
    try {
      const result = callback();
      if (result instanceof Promise) {
        return result.finally(() => timer.end());
      } else {
        timer.end();
        return result;
      }
    } catch (error) {
      timer.end();
      throw error;
    }
  };

  return {
    measureInteraction,
    getStats: () => performanceMonitor.getStats(),
    exportData: () => performanceMonitor.exportData(),
    clear: () => performanceMonitor.clear()
  };
};

export default performanceMonitor; 