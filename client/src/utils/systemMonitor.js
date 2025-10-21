// System monitoring utility for concurrent user support verification
class SystemMonitor {
  constructor() {
    this.metrics = {
      memory: [],
      cpu: [],
      connections: [],
      responseTimes: [],
      errors: []
    };
    this.startTime = Date.now();
    this.isMonitoring = false;
  }

  // Start monitoring
  start() {
    this.isMonitoring = true;
    this.monitorInterval = setInterval(() => {
      this.collectMetrics();
    }, 1000); // Collect metrics every second
  }

  // Stop monitoring
  stop() {
    this.isMonitoring = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
  }

  // Collect system metrics
  collectMetrics() {
    const timestamp = Date.now();
    
    // Memory usage
    if (typeof performance !== 'undefined' && performance.memory) {
      this.metrics.memory.push({
        timestamp,
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      });
    }

    // Connection count (simulated)
    this.metrics.connections.push({
      timestamp,
      count: this.getActiveConnections()
    });

    // Response time tracking
    this.trackResponseTime();
  }

  // Track response times
  trackResponseTime() {
    const start = performance.now();
    
    // Simulate API call
    fetch('/api/health')
      .then(response => {
        const end = performance.now();
        this.metrics.responseTimes.push({
          timestamp: Date.now(),
          duration: end - start,
          status: response.status
        });
      })
      .catch(error => {
        this.metrics.errors.push({
          timestamp: Date.now(),
          error: error.message,
          type: 'network'
        });
      });
  }

  // Get active connections (simulated)
  getActiveConnections() {
    // In a real implementation, this would query the server
    // For now, we'll simulate based on performance metrics
    return Math.floor(Math.random() * 1000) + 100; // Simulate 100-1100 connections
  }

  // Get system health status
  getSystemHealth() {
    const memoryUsage = this.getMemoryUsage();
    const avgResponseTime = this.getAverageResponseTime();
    const errorRate = this.getErrorRate();
    const connectionCount = this.getCurrentConnections();

    return {
      status: this.calculateHealthStatus(memoryUsage, avgResponseTime, errorRate),
      metrics: {
        memoryUsage,
        avgResponseTime,
        errorRate,
        connectionCount,
        uptime: Date.now() - this.startTime
      },
      recommendations: this.getRecommendations(memoryUsage, avgResponseTime, errorRate)
    };
  }

  // Calculate memory usage percentage
  getMemoryUsage() {
    if (this.metrics.memory.length === 0) return 0;
    
    const latest = this.metrics.memory[this.metrics.memory.length - 1];
    return (latest.used / latest.limit) * 100;
  }

  // Get average response time
  getAverageResponseTime() {
    if (this.metrics.responseTimes.length === 0) return 0;
    
    const recent = this.metrics.responseTimes.slice(-10); // Last 10 responses
    const sum = recent.reduce((acc, item) => acc + item.duration, 0);
    return sum / recent.length;
  }

  // Get error rate
  getErrorRate() {
    const totalRequests = this.metrics.responseTimes.length;
    const totalErrors = this.metrics.errors.length;
    
    if (totalRequests === 0) return 0;
    return (totalErrors / totalRequests) * 100;
  }

  // Get current connection count
  getCurrentConnections() {
    if (this.metrics.connections.length === 0) return 0;
    return this.metrics.connections[this.metrics.connections.length - 1].count;
  }

  // Calculate overall health status
  calculateHealthStatus(memoryUsage, avgResponseTime, errorRate) {
    if (memoryUsage > 90 || avgResponseTime > 5000 || errorRate > 10) {
      return 'critical';
    } else if (memoryUsage > 75 || avgResponseTime > 2000 || errorRate > 5) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  // Get recommendations based on metrics
  getRecommendations(memoryUsage, avgResponseTime, errorRate) {
    const recommendations = [];

    if (memoryUsage > 80) {
      recommendations.push('High memory usage detected. Consider implementing memory optimization or scaling up resources.');
    }

    if (avgResponseTime > 2000) {
      recommendations.push('Response times are exceeding 2 seconds. Optimize database queries and implement caching.');
    }

    if (errorRate > 5) {
      recommendations.push('High error rate detected. Check server logs and implement error handling improvements.');
    }

    if (this.getCurrentConnections() > 5000) {
      recommendations.push('High connection count. Consider implementing connection pooling and load balancing.');
    }

    return recommendations;
  }

  // Export monitoring data
  exportData() {
    return {
      metrics: this.metrics,
      health: this.getSystemHealth(),
      summary: {
        totalRequests: this.metrics.responseTimes.length,
        totalErrors: this.metrics.errors.length,
        averageMemoryUsage: this.getAverageMemoryUsage(),
        peakConnections: this.getPeakConnections(),
        testDuration: Date.now() - this.startTime
      }
    };
  }

  // Helper methods
  getAverageMemoryUsage() {
    if (this.metrics.memory.length === 0) return 0;
    
    const usages = this.metrics.memory.map(m => (m.used / m.limit) * 100);
    const sum = usages.reduce((acc, usage) => acc + usage, 0);
    return sum / usages.length;
  }

  getPeakConnections() {
    if (this.metrics.connections.length === 0) return 0;
    
    const counts = this.metrics.connections.map(c => c.count);
    return Math.max(...counts);
  }

  // Reset all metrics
  reset() {
    this.metrics = {
      memory: [],
      cpu: [],
      connections: [],
      responseTimes: [],
      errors: []
    };
    this.startTime = Date.now();
  }
}

// Create global instance
const systemMonitor = new SystemMonitor();

// React hook for system monitoring
export const useSystemMonitor = () => {
  const startMonitoring = () => systemMonitor.start();
  const stopMonitoring = () => systemMonitor.stop();
  const getHealth = () => systemMonitor.getSystemHealth();
  const exportData = () => systemMonitor.exportData();
  const reset = () => systemMonitor.reset();

  return {
    startMonitoring,
    stopMonitoring,
    getHealth,
    exportData,
    reset
  };
};

export default systemMonitor; 