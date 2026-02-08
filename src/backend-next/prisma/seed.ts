import { PrismaClient, UserRole, DeviceType, ControlStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ==================== 익명화 데이터 생성 함수 ====================

// 지역 코드 생성 (RG001 ~ RG020)
function generateRegions() {
  const regionNames = [
    'Metro Region A', 'Metro Region B', 'Metro Region C',
    'City Region D', 'City Region E', 'City Region F',
    'Province Region G', 'Province Region H', 'Province Region I',
    'Coastal Region J', 'Coastal Region K', 'Mountain Region L',
    'Industrial Zone M', 'Industrial Zone N', 'Residential Zone O',
    'Commercial Zone P', 'Agricultural Zone Q', 'Special Zone R',
    'Development Zone S', 'Economic Zone T'
  ];

  const managers = [
    'Manager Kim', 'Manager Lee', 'Manager Park', 'Manager Choi',
    'Manager Jung', 'Manager Kang', 'Manager Cho', 'Manager Yoon',
    'Manager Jang', 'Manager Lim', 'Manager Han', 'Manager Oh',
    'Manager Seo', 'Manager Shin', 'Manager Kwon', 'Manager Hwang',
    'Manager Ahn', 'Manager Song', 'Manager Hong', 'Manager Baek'
  ];

  const departments = [
    'Safety Department', 'Infrastructure Department', 'Monitoring Team',
    'Emergency Response', 'Disaster Prevention', 'Facility Management',
    'Operations Center', 'Control Room', 'Maintenance Division',
    'Technical Support', 'Field Operations', 'System Administration'
  ];

  return regionNames.map((name, idx) => {
    const code = `RG${String(idx + 1).padStart(3, '0')}`;
    const districtNum = String(idx + 1).padStart(2, '0');

    return {
      code,
      name,
      admin_name: `District ${String.fromCharCode(65 + Math.floor(idx / 5))}-${(idx % 5) + 1}`,
      manager: managers[idx],
      department: departments[idx % departments.length],
      contact: `02${districtNum}-${String(idx + 1).padStart(3, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      memo: `Monitoring station for ${name}`,
      is_active: idx < 18, // 처음 18개만 활성화
    };
  });
}

// 장비 생성 (100개)
function generateDevices(regionCodes: string[]) {
  const devices: any[] = [];
  let deviceIndex = 1;

  const deviceDistribution = [
    { type: DeviceType.RAIN_GAUGE, count: 30 },
    { type: DeviceType.WATER_LEVEL, count: 25 },
    { type: DeviceType.DISPLACEMENT, count: 15 },
    { type: DeviceType.SNOW_GAUGE, count: 10 },
    { type: DeviceType.WARNING_SYSTEM, count: 5 },
    { type: DeviceType.DISPLAY_BOARD, count: 10 },
    { type: DeviceType.GATE_CONTROL, count: 5 },
  ];

  const typeNames = {
    [DeviceType.RAIN_GAUGE]: 'Rain Gauge',
    [DeviceType.WATER_LEVEL]: 'Water Level Sensor',
    [DeviceType.DISPLACEMENT]: 'Displacement Meter',
    [DeviceType.SNOW_GAUGE]: 'Snow Gauge',
    [DeviceType.WARNING_SYSTEM]: 'Warning Broadcast',
    [DeviceType.DISPLAY_BOARD]: 'Display Board',
    [DeviceType.GATE_CONTROL]: 'Gate Control',
  };

  const protocols = ['TCP', 'UDP', 'HTTP', 'MQTT'];

  deviceDistribution.forEach(({ type, count }) => {
    for (let i = 0; i < count; i++) {
      const regionCode = regionCodes[deviceIndex % regionCodes.length];
      const deviceCode = `DEV${String(deviceIndex).padStart(4, '0')}`;
      const regionNum = parseInt(regionCode.slice(2));

      // 가상 좌표 생성 (한국 중부권)
      const lat = 36.0 + (regionNum * 0.1) + (Math.random() * 0.5);
      const lon = 127.0 + (regionNum * 0.05) + (Math.random() * 0.3);

      // 디스플레이 보드는 HTML 데이터 포함
      let data: string | null = null;
      if (type === DeviceType.DISPLAY_BOARD) {
        const messages = [
          'FLOOD WARNING ACTIVE',
          'ROAD CLOSURE AHEAD',
          'WATER LEVEL HIGH',
          'GATE CONTROL TEST',
          'EMERGENCY ALERT',
          'MONITORING ACTIVE',
          'CAUTION REQUIRED',
          'SYSTEM NORMAL',
        ];
        const colors = ['#ff0000', '#ff6600', '#ffcc00', '#00ff00', '#0066ff'];
        const message = messages[i % messages.length];
        const color = colors[i % colors.length];
        data = `<span style="color: ${color}">${message}</span>`;
      }

      devices.push({
        region_code: regionCode,
        device_code: deviceCode,
        area_code: `A${String(Math.floor(deviceIndex / 10)).padStart(2, '0')}`,
        device_name: `${typeNames[type]} ${String(i + 1).padStart(3, '0')}`,
        device_type: type,
        protocol: protocols[i % protocols.length],
        phone: `02${String(regionNum).padStart(2, '0')}-${String(deviceIndex).padStart(3, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        ip_address: `192.168.${Math.floor(regionNum / 2)}.${deviceIndex % 254 + 1}`,
        port: String(8000 + (deviceIndex % 1000)),
        last_status: i % 10 === 0 ? 'ERROR' : 'NORMAL',
        last_updated_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        error_count: i % 10 === 0 ? 0 : Math.floor(Math.random() * 5) + 1,
        is_active: i % 20 !== 0, // 95% 활성화
        latitude: lat,
        longitude: lon,
        address: `District ${String.fromCharCode(65 + Math.floor(regionNum / 5))}-${(regionNum % 5) + 1}, ${typeNames[type]} Station ${String(i + 1).padStart(3, '0')}`,
        data,
        unit: type === DeviceType.RAIN_GAUGE ? 'mm' : type === DeviceType.WATER_LEVEL ? 'm' : type === DeviceType.DISPLACEMENT ? 'mm' : type === DeviceType.SNOW_GAUGE ? 'cm' : null,
        comment: `Automated monitoring device - ${typeNames[type]}`,
      });

      deviceIndex++;
    }
  });

  return devices;
}

// 사용자 생성 (5명)
async function generateUsers() {
  const hashedPassword = await bcrypt.hash('demo1234', 10);

  return [
    {
      username: 'demo_admin',
      password: hashedPassword,
      email: 'admin@demo.local',
      name: 'Admin User',
      phone: '010-1234-5678',
      role: UserRole.ADMIN,
      is_active: true,
    },
    {
      username: 'demo_superadmin',
      password: hashedPassword,
      email: 'superadmin@demo.local',
      name: 'Super Admin',
      phone: '010-1234-5679',
      role: UserRole.ADMIN,
      is_active: true,
    },
    {
      username: 'demo_operator1',
      password: hashedPassword,
      email: 'operator1@demo.local',
      name: 'Operator One',
      phone: '010-2345-6781',
      role: UserRole.OPERATOR,
      is_active: true,
    },
    {
      username: 'demo_operator2',
      password: hashedPassword,
      email: 'operator2@demo.local',
      name: 'Operator Two',
      phone: '010-2345-6782',
      role: UserRole.OPERATOR,
      is_active: true,
    },
    {
      username: 'demo_viewer',
      password: hashedPassword,
      email: 'viewer@demo.local',
      name: 'Viewer User',
      phone: '010-3456-7890',
      role: UserRole.VIEWER,
      is_active: true,
    },
  ];
}

// 제어 이력 생성
function generateControlLogs(deviceIds: string[]) {
  const broadcastLogs: any[] = [];
  const displayLogs: any[] = [];
  const gateLogs: any[] = [];

  const users = ['demo_admin', 'demo_operator1', 'demo_operator2'];
  const statuses = [ControlStatus.END, ControlStatus.END, ControlStatus.END, ControlStatus.FAIL, ControlStatus.ERROR];

  // 방송 제어 이력 (50개)
  for (let i = 0; i < 50; i++) {
    const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
    const createdAt = new Date(Date.now() - Math.random() * 86400000 * 30); // 최근 30일

    broadcastLogs.push({
      device_id: deviceId,
      command: 'BROADCAST',
      param1: `${Math.floor(Math.random() * 60)}`,
      param2: `${Math.floor(Math.random() * 10)}`,
      param3: `Emergency message ${i + 1}`,
      param4: 'AUTO',
      status: statuses[i % statuses.length],
      response_data: statuses[i % statuses.length] === ControlStatus.END ? 'OK' : 'TIMEOUT',
      response_at: statuses[i % statuses.length] === ControlStatus.END ? new Date(createdAt.getTime() + 5000) : null,
      user: users[i % users.length],
      registered_at: createdAt.toISOString(),
      created_at: createdAt,
    });
  }

  // 전광판 제어 이력 (100개)
  for (let i = 0; i < 100; i++) {
    const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
    const createdAt = new Date(Date.now() - Math.random() * 86400000 * 30);

    displayLogs.push({
      device_id: deviceId,
      command: 'DISPLAY',
      param1: `${Math.floor(Math.random() * 10)}`,
      param2: `${Math.floor(Math.random() * 5)}`,
      param3: `<span style="color: #ff0000">ALERT ${i + 1}</span>`,
      status: statuses[i % statuses.length],
      user: users[i % users.length],
      registered_at: createdAt.toISOString(),
      created_at: createdAt,
    });
  }

  // 차단기 제어 이력 (30개)
  for (let i = 0; i < 30; i++) {
    const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
    const createdAt = new Date(Date.now() - Math.random() * 86400000 * 30);

    gateLogs.push({
      device_id: deviceId,
      gate_action: i % 2 === 0 ? 'OPEN' : 'CLOSE',
      light_action: i % 3 === 0 ? 'ON' : 'OFF',
      sound_action: i % 4 === 0 ? 'ON' : 'OFF',
      status: statuses[i % statuses.length],
      user: users[i % users.length],
      registered_at: createdAt.toISOString(),
      created_at: createdAt,
    });
  }

  return { broadcastLogs, displayLogs, gateLogs };
}

// ==================== 메인 시드 함수 ====================

async function main() {
  console.log('🌱 Starting database seed...\n');

  // 기존 데이터 삭제 (역순으로)
  console.log('🗑️  Cleaning existing data...');
  await prisma.gateLog.deleteMany();
  await prisma.displayLog.deleteMany();
  await prisma.broadcastLog.deleteMany();
  await prisma.userToken.deleteMany();
  await prisma.userAuthority.deleteMany();
  await prisma.user.deleteMany();
  await prisma.device.deleteMany();
  await prisma.region.deleteMany();
  console.log('✅ Cleanup complete\n');

  // 1. 지역 생성
  console.log('📍 Creating regions...');
  const regionData = generateRegions();
  await prisma.region.createMany({ data: regionData });
  console.log(`✅ Created ${regionData.length} regions\n`);

  // 2. 장비 생성
  console.log('🔧 Creating devices...');
  const deviceData = generateDevices(regionData.map(r => r.code));
  await prisma.device.createMany({ data: deviceData });
  console.log(`✅ Created ${deviceData.length} devices\n`);

  // 장비 ID 조회 (제어 이력 생성용)
  const devices = await prisma.device.findMany({ select: { id: true } });
  const deviceIds = devices.map(d => d.id);

  // 3. 사용자 생성
  console.log('👤 Creating users...');
  const userData = await generateUsers();
  for (const user of userData) {
    const createdUser = await prisma.user.create({ data: user });

    // 권한 추가
    await prisma.userAuthority.create({
      data: {
        user_id: createdUser.id,
        authority: `ROLE_${user.role}`,
      },
    });

    // 토큰 초기화
    await prisma.userToken.create({
      data: {
        user_id: createdUser.id,
        hashed_token: null,
        last_login_at: null,
      },
    });
  }
  console.log(`✅ Created ${userData.length} users\n`);

  // 4. 제어 이력 생성
  console.log('📋 Creating control logs...');
  const { broadcastLogs, displayLogs, gateLogs } = generateControlLogs(deviceIds);

  await prisma.broadcastLog.createMany({ data: broadcastLogs });
  console.log(`✅ Created ${broadcastLogs.length} broadcast logs`);

  await prisma.displayLog.createMany({ data: displayLogs });
  console.log(`✅ Created ${displayLogs.length} display logs`);

  await prisma.gateLog.createMany({ data: gateLogs });
  console.log(`✅ Created ${gateLogs.length} gate logs\n`);

  // 5. 통계 출력
  console.log('📊 Seed Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Regions:        ${regionData.length}`);
  console.log(`  Devices:        ${deviceData.length}`);
  console.log(`    - Rain Gauge:      30`);
  console.log(`    - Water Level:     25`);
  console.log(`    - Displacement:    15`);
  console.log(`    - Snow Gauge:      10`);
  console.log(`    - Warning System:   5`);
  console.log(`    - Display Board:   10`);
  console.log(`    - Gate Control:     5`);
  console.log(`  Users:          ${userData.length}`);
  console.log(`    - ADMIN:            2`);
  console.log(`    - OPERATOR:         2`);
  console.log(`    - VIEWER:           1`);
  console.log(`  Control Logs:   ${broadcastLogs.length + displayLogs.length + gateLogs.length}`);
  console.log(`    - Broadcast:       50`);
  console.log(`    - Display:        100`);
  console.log(`    - Gate:            30`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✨ Database seed completed successfully!\n');
  console.log('📝 Demo Login Credentials:');
  console.log('   Username: demo_admin');
  console.log('   Password: demo1234\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
