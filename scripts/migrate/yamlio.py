"""极简 YAML 输出。只为本项目的数据结构服务：dict/list/str/int/float/bool/None。"""
import json
import re

PLAIN = re.compile(r'^[^\s\-?:,\[\]{}#&*!|>\'"%@`][^\[\]{}#,]*$')
RESERVED = {'true', 'false', 'null', 'yes', 'no', 'on', 'off', '~'}


def scalar(v):
    if v is None:
        return 'null'
    if v is True:
        return 'true'
    if v is False:
        return 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    s = str(v)
    if s == '':
        return '""'
    if s.lower() in RESERVED:
        return json.dumps(s, ensure_ascii=False)
    if re.fullmatch(r'-?\d+(\.\d+)?', s):
        return json.dumps(s, ensure_ascii=False)
    if PLAIN.match(s) and not s.endswith(':') and ': ' not in s:
        return s
    return json.dumps(s, ensure_ascii=False)


def dump(obj, indent=0):
    pad = ' ' * indent
    out = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, (dict, list)) and v:
                out.append(f'{pad}{k}:')
                out.append(dump(v, indent + 2 if isinstance(v, dict) else indent))
            elif isinstance(v, list):
                out.append(f'{pad}{k}: []')
            elif isinstance(v, dict):
                out.append(f'{pad}{k}: {{}}')
            else:
                out.append(f'{pad}{k}: {scalar(v)}')
    elif isinstance(obj, list):
        for item in obj:
            if isinstance(item, dict):
                body = dump(item, indent + 2).split('\n')
                # 第一行并入 '- '
                first = body[0].lstrip()
                out.append(f'{pad}- {first}')
                out.extend(body[1:])
            elif isinstance(item, list):
                out.append(f'{pad}-')
                out.append(dump(item, indent + 2))
            else:
                out.append(f'{pad}- {scalar(item)}')
    return '\n'.join(out)
