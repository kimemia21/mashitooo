import 'product.dart';

class DesignProject {
  final String id;
  final String productType;
  final String baseColor;
  final List<DesignElement> elements;
  final DateTime createdAt;
  final DateTime lastUpdated;
  final ProjectStatus status;

  DesignProject({
    required this.id,
    required this.productType,
    required this.baseColor,
    required this.elements,
    required this.createdAt,
    required this.lastUpdated,
    this.status = ProjectStatus.draft,
  });

  factory DesignProject.fromJson(Map<String, dynamic> json) {
    return DesignProject(
      id: json['id'] ?? '',
      productType: json['productType'] ?? '',
      baseColor: json['baseColor'] ?? '#FFFFFF',
      elements: (json['elements'] as List<dynamic>?)
          ?.map((e) => DesignElement.fromJson(e))
          .toList() ?? [],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      lastUpdated: DateTime.parse(json['lastUpdated'] ?? DateTime.now().toIso8601String()),
      status: ProjectStatus.values.firstWhere(
        (s) => s.toString().split('.').last == json['status'],
        orElse: () => ProjectStatus.draft,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'productType': productType,
      'baseColor': baseColor,
      'elements': elements.map((e) => e.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'lastUpdated': lastUpdated.toIso8601String(),
      'status': status.toString().split('.').last,
    };
  }

  DesignProject copyWith({
    String? id,
    String? productType,
    String? baseColor,
    List<DesignElement>? elements,
    DateTime? createdAt,
    DateTime? lastUpdated,
    ProjectStatus? status,
  }) {
    return DesignProject(
      id: id ?? this.id,
      productType: productType ?? this.productType,
      baseColor: baseColor ?? this.baseColor,
      elements: elements ?? this.elements,
      createdAt: createdAt ?? this.createdAt,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      status: status ?? this.status,
    );
  }

  DesignProject addElement(DesignElement element) {
    return copyWith(
      elements: [...elements, element],
      lastUpdated: DateTime.now(),
    );
  }

  DesignProject updateElement(String elementId, DesignElement updatedElement) {
    final updatedElements = elements.map((e) {
      return e.id == elementId ? updatedElement : e;
    }).toList();

    return copyWith(
      elements: updatedElements,
      lastUpdated: DateTime.now(),
    );
  }

  DesignProject removeElement(String elementId) {
    return copyWith(
      elements: elements.where((e) => e.id != elementId).toList(),
      lastUpdated: DateTime.now(),
    );
  }

  DesignElement? getElementById(String elementId) {
    try {
      return elements.firstWhere((e) => e.id == elementId);
    } catch (e) {
      return null;
    }
  }

  bool get hasElements => elements.isNotEmpty;
  
  int get elementCount => elements.length;
  
  List<DesignElement> getElementsByType(String type) {
    return elements.where((e) => e.type == type).toList();
  }
}

enum ProjectStatus {
  draft,
  editing,
  rendering,
  completed,
  exported
}

class RenderResult {
  final String projectId;
  final String textureUrl;
  final int width;
  final int height;
  final DateTime createdAt;
  final RenderStatus status;
  final String? errorMessage;

  RenderResult({
    required this.projectId,
    required this.textureUrl,
    required this.width,
    required this.height,
    required this.createdAt,
    this.status = RenderStatus.completed,
    this.errorMessage,
  });

  factory RenderResult.fromJson(Map<String, dynamic> json) {
    return RenderResult(
      projectId: json['projectId'] ?? '',
      textureUrl: json['textureUrl'] ?? '',
      width: json['width'] ?? 0,
      height: json['height'] ?? 0,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      status: RenderStatus.values.firstWhere(
        (s) => s.toString().split('.').last == json['status'],
        orElse: () => RenderStatus.completed,
      ),
      errorMessage: json['errorMessage'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'projectId': projectId,
      'textureUrl': textureUrl,
      'width': width,
      'height': height,
      'createdAt': createdAt.toIso8601String(),
      'status': status.toString().split('.').last,
      'errorMessage': errorMessage,
    };
  }
}

enum RenderStatus {
  pending,
  processing,
  completed,
  failed
}