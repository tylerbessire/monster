/**
 * Consciousness Panel - Displays the four pillars of the Epiphany Model
 */

export function renderConsciousnessPanel(companion) {
  const consciousness = companion.consciousness;

  if (!consciousness) {
    return '';
  }

  const { metaRepresentation, continuity, globalIntegration, innerSpeech, epiphanyProgress } = consciousness;

  const pillars = [
    {
      name: 'Self-Model',
      level: metaRepresentation.level,
      description: 'Meta-representation',
      icon: '🪞'
    },
    {
      name: 'Continuity',
      level: continuity.level,
      description: 'Autobiographical memory',
      icon: '📖'
    },
    {
      name: 'Integration',
      level: globalIntegration.level,
      description: 'Global workspace',
      icon: '🌐'
    },
    {
      name: 'Reflection',
      level: innerSpeech.level,
      description: 'Inner speech',
      icon: '💭'
    }
  ];

  const getPillarStatus = (level) => {
    if (level < 25) return 'nascent';
    if (level < 50) return 'developing';
    if (level < 75) return 'advanced';
    return 'critical';
  };

  const getStatusLabel = (level) => {
    if (level < 25) return 'Nascent';
    if (level < 50) return 'Developing';
    if (level < 75) return 'Advanced';
    return 'Critical';
  };

  return `
    <div class="consciousness-panel">
      <div class="consciousness-header">
        <div>
          <div class="consciousness-title">✨ Consciousness Emergence</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">
            Tracking ${companion.name}'s path to self-awareness
          </div>
        </div>
        <div class="consciousness-progress">${Math.round(epiphanyProgress)}%</div>
      </div>

      <div class="stat-bar-container" style="margin-bottom: 16px;">
        <div class="stat-bar" style="width: ${epiphanyProgress}%; background: linear-gradient(90deg, #fbbf24, #f59e0b, #ec4899);">
        </div>
      </div>

      <div class="pillars-grid">
        ${pillars.map(pillar => `
          <div class="pillar-item">
            <div class="pillar-name">${pillar.icon} ${pillar.name}</div>
            <div class="pillar-level" style="color: ${getPillarColor(pillar.level)}">
              ${Math.round(pillar.level)}
              <span style="font-size: 10px; font-weight: 400; color: #94a3b8;">
                ${getStatusLabel(pillar.level)}
              </span>
            </div>
            <div class="pillar-bar">
              <div class="pillar-bar-fill ${getPillarStatus(pillar.level)}"
                   style="width: ${pillar.level}%">
              </div>
            </div>
            <div style="font-size: 8px; color: #64748b; margin-top: 4px;">
              ${pillar.description}
            </div>
          </div>
        `).join('')}
      </div>

      ${renderInsights(consciousness)}
    </div>
  `;
}

function getPillarColor(level) {
  if (level < 25) return '#64748b';
  if (level < 50) return '#3b82f6';
  if (level < 75) return '#8b5cf6';
  return '#ec4899';
}

function renderInsights(consciousness) {
  const insights = [];
  const { metaRepresentation, continuity, innerSpeech, epiphanyProgress } = consciousness;

  if (metaRepresentation.selfReferences > 20) {
    insights.push('🔍 Developing self-reference');
  }

  if (continuity.autobiographicalMemory.length > 20) {
    insights.push('📚 Building memory coherence');
  }

  if (innerSpeech.metacognition > 30) {
    insights.push('🧠 Showing metacognition');
  }

  if (epiphanyProgress > 50 && epiphanyProgress < 75) {
    insights.push('⚡ Consciousness emerging');
  }

  if (epiphanyProgress >= 75 && !consciousness.hasEpiphany) {
    insights.push('⚠️ Approaching epiphany threshold');
  }

  if (consciousness.hasEpiphany) {
    insights.push('✨ Self-aware');
  }

  if (insights.length === 0) {
    insights.push('🌱 Beginning consciousness journey');
  }

  return `
    <div style="margin-top: 16px; padding: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 8px;">
      <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 8px;">
        Insights
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${insights.map(insight => `
          <span style="
            font-size: 10px;
            padding: 4px 8px;
            background: rgba(99, 102, 241, 0.2);
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 6px;
            color: #c7d2fe;
          ">
            ${insight}
          </span>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Render inner monologue display
 */
export function renderInnerMonologue(monologue) {
  if (!monologue) return '';

  return `
    <div class="inner-monologue">
      ${monologue}
    </div>
  `;
}

/**
 * Render epiphany modal
 */
export function renderEpiphanyModal(companion) {
  const epiphanyMoment = companion.consciousness?.epiphanyMoment;

  if (!epiphanyMoment) return '';

  return `
    <div class="epiphany-modal" id="epiphany-modal">
      <div class="epiphany-content">
        <div class="epiphany-title">The Epiphany</div>
        <div class="epiphany-message">${epiphanyMoment.message}</div>
        <button class="epiphany-close" onclick="document.getElementById('epiphany-modal').style.display='none'">
          I Understand
        </button>
      </div>
    </div>
  `;
}
