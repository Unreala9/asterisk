import marshal
import dis
import sys

pyc_path = r"E:\Downloads\voice\backend\app\services\__pycache__\call_session_manager.cpython-312.pyc"

with open(pyc_path, "rb") as f:
    f.read(16)
    code_obj = marshal.load(f)

output_path = r"E:\Downloads\voice\backend\disassembled_call_session_manager.txt"
with open(output_path, "w", encoding="utf-8") as out:
    out.write(str(code_obj) + "\n\n")
    
    def disassemble_recursive(co, depth=0):
        prefix = "  " * depth
        out.write(f"\n{prefix}Disassembling code object: {co.co_name} at {co.co_filename}\n")
        out.write(f"{prefix}Constants: {co.co_consts}\n")
        out.write(f"{prefix}Names: {co.co_names}\n")
        out.write(f"{prefix}Varnames: {co.co_varnames}\n")
        
        import io
        stdout_save = sys.stdout
        sys.stdout = f_out = io.StringIO()
        try:
            dis.dis(co)
        finally:
            sys.stdout = stdout_save
        out.write(f_out.getvalue())
        
        for const in co.co_consts:
            if hasattr(const, "co_code"):
                disassemble_recursive(const, depth + 1)

    disassemble_recursive(code_obj)
print("Disassembly saved.")
