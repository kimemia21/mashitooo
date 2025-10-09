class Product {
  final String id;
  final String name;
  final String type;
  final String modelUrl;
  final String thumbnailUrl;
  final double basePrice;
  final List<String> availableColors;

  Product({
    required this.id,
    required this.name,
    required this.type,
    required this.modelUrl,
    required this.thumbnailUrl,
    required this.basePrice,
    this.availableColors = const ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF'],
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? '',
      modelUrl: json['modelUrl'] ?? '',
      thumbnailUrl: json['thumbnailUrl'] ?? '',
      basePrice: (json['basePrice'] ?? 0.0).toDouble(),
      availableColors: List<String>.from(json['availableColors'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type,
      'modelUrl': modelUrl,
      'thumbnailUrl': thumbnailUrl,
      'basePrice': basePrice,
      'availableColors': availableColors,
    };
  }
}

class DesignElement {
  final String id;
  final String type; // 'sticker', 'text', 'pattern'
  final Map<String, dynamic> properties;
  final Position3D position;
  final Scale3D scale;
  final Rotation3D rotation;
  final DateTime timestamp;

  DesignElement({
    required this.id,
    required this.type,
    required this.properties,
    required this.position,
    required this.scale,
    required this.rotation,
    required this.timestamp,
  });

  factory DesignElement.fromJson(Map<String, dynamic> json) {
    return DesignElement(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      properties: Map<String, dynamic>.from(json['properties'] ?? {}),
      position: Position3D.fromJson(json['position'] ?? {}),
      scale: Scale3D.fromJson(json['scale'] ?? {}),
      rotation: Rotation3D.fromJson(json['rotation'] ?? {}),
      timestamp: DateTime.parse(json['timestamp'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'properties': properties,
      'position': position.toJson(),
      'scale': scale.toJson(),
      'rotation': rotation.toJson(),
      'timestamp': timestamp.toIso8601String(),
    };
  }

  DesignElement copyWith({
    String? id,
    String? type,
    Map<String, dynamic>? properties,
    Position3D? position,
    Scale3D? scale,
    Rotation3D? rotation,
    DateTime? timestamp,
  }) {
    return DesignElement(
      id: id ?? this.id,
      type: type ?? this.type,
      properties: properties ?? this.properties,
      position: position ?? this.position,
      scale: scale ?? this.scale,
      rotation: rotation ?? this.rotation,
      timestamp: timestamp ?? this.timestamp,
    );
  }
}

class Position3D {
  final double x;
  final double y;
  final double z;

  Position3D({required this.x, required this.y, required this.z});

  factory Position3D.fromJson(Map<String, dynamic> json) {
    return Position3D(
      x: (json['x'] ?? 0.0).toDouble(),
      y: (json['y'] ?? 0.0).toDouble(),
      z: (json['z'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {'x': x, 'y': y, 'z': z};
  }
}

class Scale3D {
  final double x;
  final double y;
  final double z;

  Scale3D({required this.x, required this.y, required this.z});

  factory Scale3D.fromJson(Map<String, dynamic> json) {
    return Scale3D(
      x: (json['x'] ?? 1.0).toDouble(),
      y: (json['y'] ?? 1.0).toDouble(),
      z: (json['z'] ?? 1.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {'x': x, 'y': y, 'z': z};
  }
}

class Rotation3D {
  final double x;
  final double y;
  final double z;

  Rotation3D({required this.x, required this.y, required this.z});

  factory Rotation3D.fromJson(Map<String, dynamic> json) {
    return Rotation3D(
      x: (json['x'] ?? 0.0).toDouble(),
      y: (json['y'] ?? 0.0).toDouble(),
      z: (json['z'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {'x': x, 'y': y, 'z': z};
  }
}