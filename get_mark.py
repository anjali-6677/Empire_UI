import zlib
import struct

def crop_png(input_path, output_path, max_w_ratio=0.22):
    with open(input_path, 'rb') as f:
        data = f.read()
    
    # Read PNG header
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    
    # Parse chunks
    pos = 8
    width = height = bit_depth = color_type = None
    idat_bytes = bytearray()
    
    while pos < len(data):
        length, chunk_type = struct.unpack('>I4s', data[pos:pos+8])
        chunk_data = data[pos+8:pos+8+length]
        pos += 12 + length
        
        if chunk_type == b'IHDR':
            width, height, bit_depth, color_type, compression, filter_method, interlace = struct.unpack('>IIBBBBB', chunk_data)
        elif chunk_type == b'IDAT':
            idat_bytes.extend(chunk_data)
        elif chunk_type == b'IEND':
            break

    # Decompress scanlines
    decompressed = zlib.decompress(bytes(idat_bytes))
    bytes_per_pixel = 4 if color_type == 6 else 3
    stride = 1 + width * bytes_per_pixel
    
    new_width = int(width * max_w_ratio)
    new_stride = 1 + new_width * bytes_per_pixel
    
    new_decompressed = bytearray()
    for y in range(height):
        line_start = y * stride
        filter_byte = decompressed[line_start:line_start+1]
        pixel_data = decompressed[line_start+1 : line_start+1 + new_width * bytes_per_pixel]
        new_decompressed.extend(filter_byte)
        new_decompressed.extend(pixel_data)
        
    # Compress new scanlines
    new_idat = zlib.compress(bytes(new_decompressed))
    
    def make_chunk(chunk_type, chunk_data):
        crc = zlib.crc32(chunk_type + chunk_data) & 0xffffffff
        return struct.pack('>I', len(chunk_data)) + chunk_type + chunk_data + struct.pack('>I', crc)
        
    new_ihdr_data = struct.pack('>IIBBBBB', new_width, height, bit_depth, color_type, 0, 0, 0)
    
    out = b'\x89PNG\r\n\x1a\n'
    out += make_chunk(b'IHDR', new_ihdr_data)
    out += make_chunk(b'IDAT', new_idat)
    out += make_chunk(b'IEND', b'')
    
    with open(output_path, 'wb') as f_out:
        f_out.write(out)
    print(f"Cropped PNG to {new_width}x{height} successfully!")

crop_png('public/flutebyte-logo.png', 'public/flutebyte-mark.png', 0.22)
