# 3D model credits

Geometry for the chess pieces in this folder comes from Poly Haven (https://polyhaven.com), released under CC0.
Only positions, normals and indices are kept; textures are dropped and the site applies its own materials.

- `knight.bin`, `king.bin`, `queen.bin`: "Chess Set"

File layout: uint32 vertex count, uint32 index count, float32 positions (xyz, centred, longest side = 1),
int8 normals (xyz, padded to 4 bytes), uint16 indices (padded to 4 bytes). Little endian.
